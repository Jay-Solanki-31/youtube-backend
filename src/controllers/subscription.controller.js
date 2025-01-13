import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "channel Id is missing")
    }

    const subscription = await Subscription.findOne(
        {
            channel: channelId,
            subscriber: req.user._id
        }
    );

    if (!subscription) {
        await Subscription.create(
            {
                channel: channelId,
                subscriber: req.user._id,
            }
        )
    } else {
        await Subscription.findByIdAndDelete(subscription._id);
    }

    const subscribed = await Subscription.findOne(
        {
            channel:channelId,
            subscriber: req.user._id
        }
    )

    let isSubscribed;
    if(!subscribed){
        isSubscribed = false
    }else{
        isSubscribed=true
    }

    return res.status(200).json(new ApiResponse(200,
        {
            isSubscribed
        },
        "success")
    )
});

const getChannelSubscriber = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "channel id is required")
    }

    const channelSubscribers = await Subscription.aggregate([
        { $match: { channel: new mongoose.Types.ObjectId(`${channelId}`) } },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                subscriber: 1,
                createdAt: 1
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, channelSubscribers, "channel's subscribers fetched"));
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "channel id is required")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(`${channelId}`) }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                channel: 1,
                createdAt: 1
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, subscribedChannels, "success"))
})

export { toggleSubscription, getChannelSubscriber, getSubscribedChannels }