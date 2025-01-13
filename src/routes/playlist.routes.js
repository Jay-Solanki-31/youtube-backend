
import { Router } from "express";
import { addVideos, createPlaylist, deletePlaylist, getPlaylist, getUserPlaylist, removePlaylistVideo, updatePlaylist } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router =Router();

router.route("/").post(verifyJWT,createPlaylist);
router.route("/add-videos/:playlistId/:videoId").post(verifyJWT,addVideos);
router.route("/get-playlist/:playlistId").get(verifyJWT,getPlaylist);
router.route("/get-user-playlist/:userId").get(verifyJWT,getUserPlaylist);
router.route("/delete-playlist/:playlistId").post(verifyJWT,deletePlaylist);
router.route("/update-playlist/:playlistId").post(verifyJWT,updatePlaylist);
router.route("/remove-video/:playlistId/:videoId").post(verifyJWT,removePlaylistVideo)

export default router;
