import Web3 from "web3";
import Robonomics, { MessageProviderIpfsApi as Provider } from "robonomics-js";
import ipfs from "./ipfs";
import readRosbag from "./rosbag";
import config from "../config";
import Auctions from "../models/table";

let robonomics = null;
export function init(config, web3, ipfs) {
  robonomics = new Robonomics({
    web3,
    messageProvider: new Provider(ipfs),
    ...config,
  });
  return robonomics;
}

export default function () {
  if (robonomics === null) {
    throw new Error("Robonomics not init");
  }
  return robonomics;
}

export function start(params = {}) {
  return init(
    { ...config.ROBONOMICS, ...params },
    new Web3(new Web3.providers.WebsocketProvider(config.WEB3)),
    ipfs
  );
}

export function main(io) {
  const robonomics = start();
  robonomics.ready().then(() => {
    console.log("xrt", robonomics.xrt.address);
    console.log("factory", robonomics.factory.address);
    console.log("lighthouse", robonomics.lighthouse.address);
    robonomics.onDemand(config.MODEL, (msg) => {
      Auctions.findOne({ where: { objective: msg.objective } }).then(
        (auction) => {
          console.log(msg.cost, auction.cost, msg.cost > auction.cost);
          if (
            auction &&
            auction.status === "auction" &&
            Number(msg.cost) > Number(auction.cost)
          ) {
            auction
              .update({
                account: msg.sender,
                cost: Number(msg.cost),
                original: JSON.stringify(msg.toObject()),
              })
              .then((r) => {
                io.emit("auction", {
                  index: auction.id,
                  auction: r.dataValues,
                });
              });
          }
        }
      );
    });
    robonomics.onOffer(config.MODEL, (msg) => {
      console.log(msg.objective);
      console.log(msg);
      readRosbag(msg.objective, {}, (topic, msgBag) => {
        if (topic === "/painter_lot") {
          const id = Number(msgBag.id);
          const vid = msgBag.video_path;
          const name = msgBag.name;
          Auctions.findOne({ where: { id } }).then((auction) => {
            if (auction && auction.status === "coming") {
              auction
                .update({
                  status: "auction",
                  bid: JSON.stringify(msg.toObject()),
                  vid,
                  name,
                  objective: msg.objective,
                })
                .then(() => {
                  Auctions.findAll({ raw: true }).then((rows) => {
                    io.emit("list", rows);
                  });
                });
            }
          });
        }
      });
    });
  });
}
