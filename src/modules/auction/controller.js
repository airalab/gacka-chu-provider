import Auctions from "../../models/table";
import Demands from "../../models/demands";
import { getIo } from "../../socket";

export default {
  async list(req, res) {
    try {
      const rows = await Auctions.findAll({ raw: true });
      res.send({
        result: rows,
      });
    } catch (_) {
      res.send({
        error: "not found",
      });
    }
  },
  async auction(req, res) {
    try {
      const auction = await Auctions.findOne({
        where: { id: req.params.id },
        raw: true,
      });
      if (auction) {
        res.send({
          result: auction,
        });
      } else {
        res.send({
          error: "not found",
        });
      }
    } catch (_) {
      res.send({
        error: "not found",
      });
    }
  },
  demand(req, res) {
    const msg = req.body;
    const io = getIo();
    Demands.create({
      original: JSON.stringify(msg),
    });
    Auctions.findOne({ where: { objective: msg.objective } })
      .then((auction) => {
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
              original: JSON.stringify(msg),
            })
            .then((r) => {
              io.emit("auction", {
                index: auction.id,
                auction: r.dataValues,
              });
              res.send({
                result: "ok",
              });
            })
            .catch(() => {
              res.send({
                error: "not found",
              });
            });
        }
      })
      .catch(() => {
        res.send({
          error: "not found",
        });
      });
  },
};
