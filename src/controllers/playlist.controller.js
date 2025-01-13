import mongoose, { Schema } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    // console.log(req.body);


    if (!name) {
        throw new ApiError(400, "Name is required")
    }

    const playlist = await Playlist.create(
        {
            name,
            description
        }
    )

    if (!playlist) {
        throw new ApiError(500, "something went wrong while creating playlist")
    }

    playlist.owner = req.user?._id;
    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, "playlist created"))
})

const addVideos = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params;
    // console.log(req.params);


    if (!videoId || !playlistId) {
        throw new ApiError(400, "video id r playlist id is missing");
    }

    const playlist = await Playlist.findById(playlistId);
    // console.log(playlist);


    if (!playlist) {
        throw new ApiError(404, " playlist not found")
    }

    if (!playlist?.videos?.includes(videoId)) {
        // console.log(videoId);

        playlist.videos.push(videoId);
        // console.log(playlist.videos);
        await playlist.save();
    }

    return res.status(200).json(new ApiResponse(200, playlist, "video added successfully"));
})

const getPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "playlist id is missing")
    }

    // const playlist = await Playlist.findById(playlistId).populate("video");
    const playlist = await Playlist.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(playlistId) }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "video"
            }
        }
    ])

    if (!playlist?.length) {
        throw new ApiError(404, "playlist not found")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "playlist fetched"))
})

const getUserPlaylist = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "user id is missing")
    }

    // const playlist = await Playlist.find({owner: userId})
    const playlist = await Playlist.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(`${userId}`) }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        }
    ])

    if (!playlist?.length) {
        throw new ApiError(404, "playlist not found")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "playlist fetched"));

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "playlist id is missing")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) {
        throw new ApiError(400, "playlist not found")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "playlist delete successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!playlistId) {
        throw new ApiError(400, "playlist id is missing")
    }

    const { name, description } = req.body;
    if (!name) {
        throw new ApiError(400, "name is required")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description: description || ""
            }
        },
        {
            new: true
        }
    )

    if (!playlist) {
        throw new ApiError(404, "playlist not found")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "playlist updated"))

})

const removePlaylistVideo = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    // console.log(req.params);
    

    if (!videoId || !playlistId) {
        throw new ApiError(400, "playlist id or video id is missing")
    }

    const playlist = await Playlist.findById(playlistId);
    console.log(playlist);
    

    playlist.videos = playlist.videos.filter(item => item != videoId);
    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, " video removed successfully"));
})

export { createPlaylist, addVideos, getPlaylist, getUserPlaylist, deletePlaylist, updatePlaylist, removePlaylistVideo }