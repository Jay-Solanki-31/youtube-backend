import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelSubscriber, getSubscribedChannels, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/:channelId").post(toggleSubscription)
router.route("/channel-subs/:channelId").post(getChannelSubscriber)
router.route("/subscribed-channels/:channelId").post(getSubscribedChannels)

export default router