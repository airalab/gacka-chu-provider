import fs from "fs";
import { open } from "rosbag";
import ipfs from "./ipfs";

export default async function readRosbag(hash, options, cb) {
  ipfs.get(hash, async (e, r) => {
    const outputFilename = "/tmp/file.ros";
    fs.writeFileSync(outputFilename, r[0].content);
    const bag = await open(outputFilename);
    bag.readMessages(options, (result) => {
      cb(result.topic, result.message);
    });
  });
}
