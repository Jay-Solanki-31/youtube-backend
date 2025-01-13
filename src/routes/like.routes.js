import { Router } from "express";
import { getAllLikedVideos, toggelCommentLike, toggleVideoLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/vid-like/:videoId").post(toggleVideoLike);
router.route("/comment-like/:commentId").post(toggelCommentLike);
// router.route("/post-like/:postId").post(toggleCommunityPostLike);
router.route("/get-liked-vid").get(getAllLikedVideos);

export default router;