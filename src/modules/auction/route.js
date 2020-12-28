import express from "express";
import controller from "./controller";

const router = express.Router();

router.get("/", controller.home);
router.get("/list", controller.list);
router.get("/auction/:id", controller.auction);
router.post("/demand", controller.demand);

export default router;
