import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "video id is missing")
    }

    const isLiked = await Like.findOne(
        {
            video: videoId,
            likedBy: req.user._id
        }
    )

    if (!isLiked) {
        const like = await Like.create(
            {
                video: videoId,
                likedBy: req.user._id
            }
        )

        if (!like) {
            throw new ApiError(400, "error while liking")
        }
    } else {
        await Like.findByIdAndDelete(isLiked._id)
    }

    const videoLiked = await Like.findOne(
        {
            video: videoId,
            likedBy: req.user._id
        }
    )

    let isVideoLiked;

    if (!videoLiked) {
        isVideoLiked = false
    } else {
        isVideoLiked = true
    }

    return res.status(200).json(new ApiResponse(200, { isVideoLiked }, " video liked"))
})

const toggelCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "comment id is missing")
    }

    const isLiked = await Like.findOne(
        {
            comment: commentId,
            likedBy: req.user._id
        }
    )

    if (!isLiked) {
        const like = await Like.create(
            {
                comment: commentId,
                likedBy: req.user._id
            }
        )
        if (!like) {
            throw new ApiError(400, "error while liking comment")
        }
    } else {
        await Like.findByIdAndDelete(isLiked._id)
    }

    const commentLiked = await Like.findOne(
        {
            comment: commentId,
            likedBy: req.user._id
        }
    )

    let isCommentLiked;

    if (!commentLiked) {
        isCommentLiked = false
    } else {
        isCommentLiked = true
    }

    return res.status(200).json(new ApiResponse(200, { isCommentLiked }, "like status"))
})

// const toggleCommunityPostLike = asyncHandler(async (req, res) => {
//     const { postId } = req.params;
//     if (!postId) {
//         throw new ApiError(400, "post id is missing")
//     }

//     const isLiked = await Like.findOne(
//         {
//             community: postId,
//             likedBy: req.user._id
//         }
//     )

//     if (!isLiked) {
//         const likedPost = await Like.create(
//             {
//                 community: postId,
//                 likedBy: req.user._id
//             }
//         )
//         if (!likedPost) {
//             throw new ApiError(400, "error while liking post")
//         }
//     } else {
//         await Like.findByIdAndDelete(isLiked._id);
//     }

//     const like = await Like.findOne(
//         {
//             community: postId,
//             likedBy: req.user._id
//         }
//     )

//     let isCommunityLiked;

//     if (!like) {
//         isCommunityLiked = false
//     } else {
//         isCommunityLiked = true
//     }

//     return res.status(200).json(new ApiResponse(200, { isCommunityLiked }, "community like status"))
// })

const getAllLikedVideos = asyncHandler(async (req, res) => {

    const likedVideos = await Like.find(
        {
            likedBy: req.user._id,
            video:{$ne: null}
        }
    ).populate("video")

    if (!likedVideos) {
        throw new ApiError(400,"error while fetching liked videos")
    }
    
    return res.status(200).json(new ApiResponse(200,likedVideos,"liked video fetched"))
})

export { toggleVideoLike, toggelCommentLike,getAllLikedVideos }