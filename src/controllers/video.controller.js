import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
// import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    let sortCriteria = {}
    let videoQuery = {}

    if (userId) {
        videoQuery.userId = userId
    }

    if (query) {
        videoQuery.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ]
    }
    
    if (sortBy && sortType) {
        sortCriteria[sortBy] = sortType === "desc" ? -1 : 1;
    }
    
    const videos = await Video.find(videoQuery)
    .sort(sortCriteria)
    .skip((page - 1) * limit)
    .limit(limit);
    
    if (!videos) {
        throw new ApiError(400, "error while fetching all videos")
    }
    
    return res.status(200).json(new ApiResponse(200, videos, "videos fetched"))
})


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if ([title, description].some((field) => !field?.trim())) {
        throw new ApiError(400, "Title and description are required.");
    }

    if (!req.files?.videoFile || !req.files?.thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required.");
    }

    const videoFileLocalPath = req.files.videoFile[0]?.path;
    const thumbnailLocalPath = req.files.thumbnail[0]?.path;

    try {
        const videoFileUploadResult = await uploadOnCloudinary(videoFileLocalPath);
        const thumbnailUploadResult = await uploadOnCloudinary(thumbnailLocalPath);

        if (!videoFileUploadResult?.url || !thumbnailUploadResult?.url) {
            throw new ApiError(500, "Failed to upload files to Cloudinary.");
        }


        // const videoDuration = 120;

        const video = await Video.create({
            videoFile: videoFileUploadResult.url,
            thumbnail: thumbnailUploadResult.url,
            title,
            description,
            duration: publishAVideo.duration,
            owner: req.user._id,
        });

        return res.status(201).json(
            new ApiResponse(201, video, "Video published successfully.")
        );
    } catch (error) {
        throw new ApiError(500, `Something went wrong: ${error.message}`);
    }
});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "video id is missing")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(500, "error while fetching video,No video    ")
    }

    return res.status(200).json(new ApiResponse(200, video, "video fetched"))

});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    // console.log(req.body);
// 
    
    if (!videoId) {
        throw new ApiError(400, "video id is missing")
    }

    if (!title && !description) {
        throw new ApiError(400, "title and description are required")
    }

    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail file is missing")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
        throw new ApiError(400, "thumbnail upload failed")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail?.url
            }
        },
        {
            new: true
        }
    )

    if (!video) {
        throw new ApiError(500, "error while updating video")
    }

    return res.status(200).json(new ApiResponse(200, video, "updated"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "video Id is missing")
    }

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(new ApiResponse(200, {}, "video deleted successfully"))
})


const toggleIsPublished = asyncHandler(async(req,res)=>{
    const {videoId} = req.params;

    if(!videoId){
        throw new ApiError(400,"video id is missing")
    }

    const video = await Video.findById(videoId);

    video.isPublished = !video.isPublished;
    await video.save()
    
    return res.json(new ApiResponse(200,video,"updated"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    toggleIsPublished
}
