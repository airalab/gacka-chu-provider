import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import createServer from "./server";
import { setIo } from "./socket";
import db from "./models/db";
import auction from "./modules/auction/route";
import config from "./config";
import logger from "./services/logger";
import { main } from "./services/robonomics";

const app = express();
const server = createServer(app);
const io = setIo(server);
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());
main(io);

app.use("/", auction);

db.sequelize.sync().then(() => {
  server.listen(config.PORT, config.HOST, () => {
    logger.info("Web listening " + config.HOST + " on port " + config.PORT);
  });
});
