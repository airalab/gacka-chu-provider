import IpfsHttpClient from "ipfs-http-client";
import config from "../config";

const ipfs = IpfsHttpClient(config.IPFS);
export default ipfs;
