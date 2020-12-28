import path from "path";
import config from "../config.json";

export default {
  SSL_ENABLE: process.env.SSL_ENABLE
    ? process.env.SSL_ENABLE.trim().toLowerCase() === "true"
    : false,
  SSL: {
    key: process.env.SSL_KEY || "",
    cer: process.env.SSL_CER || "",
  },
  PATH_CACHE: path.join(__dirname, "/../files/cache_list.json"),
  PATH_DB: path.join(__dirname, "/../files/database.sqlite"),
  ...config,
};
