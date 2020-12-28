import { Liability, Messenger } from "robonomics-js";
import { start } from "./services/robonomics";
import db from "./models/db";
import Auctions from "./models/table";
import config from "./config";
import { Op } from "sequelize";

const robonomics = start();

const checkResult = (liability, auction) => {
  return liability.getInfo().then((r) => {
    if (r.result !== "") {
      console.log("result 2", r.result);
      return auction.update({
        status: "close",
        liability: liability.address,
      });
    } else {
      console.log("result 2 not");
    }
    return true;
  });
};

robonomics.ready().then(() => {
  console.log("xrt", robonomics.xrt.address);
  console.log("factory", robonomics.factory.address);
  console.log("lighthouse", robonomics.lighthouse.address);

  robonomics.onDemand(config.MODEL, (msg) => {
    console.log(msg);
  });

  setTimeout(() => {
    db.sequelize.sync().then(() => {
      console.log("start proccess");
      // для аукционов с статусом finish нужно проверить result и выставить close
      Auctions.findAll({ where: { status: "finish" } })
        .then((rows) => {
          console.log("status finish");
          const modules = [];
          if (rows) {
            rows.forEach((auction) => {
              const liability = new Liability(
                robonomics.web3,
                auction.liability,
                auction.liability
              );
              modules.push(checkResult(liability, auction));
            });
          }
          return Promise.all(modules);
        })
        .then(() => {
          console.log("status stop");
          // для аукционов которые нужно закрыть
          return Auctions.findAll({
            where: {
              [Op.or]: [
                {
                  status: {
                    [Op.eq]: "auction",
                  },
                },
                {
                  status: {
                    [Op.eq]: "stop",
                  },
                },
              ],
              dateEnd: {
                [Op.lte]: new Date(),
              },
            },
          });
        })
        .then((rows) => {
          let watch = false;
          if (rows.length > 0) {
            rows.forEach((auction) => {
              if (auction.dataValues.original === "") {
                console.log("close", auction.id);
                auction.update({
                  status: "close",
                });
                return;
              }
              auction.update({
                status: "stop",
              });
              let original;
              try {
                original = JSON.parse(auction.dataValues.original);
              } catch (err) {
                console.log("err json original", auction.id);
                return;
              }
              original.cost = Number(original.cost);
              const msg = Messenger.create("demand", original);
              // const msg = robonomics.messenger.create("demand", original);
              robonomics.messenger.channel.send(msg.encode());
              const watcher = robonomics.onLiability((_, liability) => {
                liability
                  .equalDemand(msg.getHash())
                  .then((r) => {
                    if (r) {
                      watcher.unsubscribe();
                      console.log(liability.address);
                      auction.update({
                        status: "finish",
                        liability: liability.address,
                      });
                      liability.onResult((result) => {
                        console.log("result", result);
                        auction.update({
                          status: "close",
                          liability: liability.address,
                        });
                      });
                    }
                  })
                  .catch((e) => {
                    console.log(e);
                  });
              });
              watch = true;
            });
          } else {
            console.log("Not auction");
          }
          if (watch === false) {
            console.log("stop process 15s");
            setTimeout(() => {
              process.exit(0);
            }, 15 * 1000);
          } else {
            console.log(
              "watch liability",
              config.TIMEOUT_LIABILITY_RESULT,
              "min"
            );
            setTimeout(() => {
              process.exit(0);
            }, config.TIMEOUT_LIABILITY_RESULT * 60 * 1000);
          }
        })
        .catch((e) => {
          console.log(e);
          process.exit(0);
        });
    });
  }, 2000);
});
