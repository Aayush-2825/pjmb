import { Account } from "../models/account.model.js";
import asyncHandler from "../utils/async-handler.js";

const listAccounts = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const accounts = await Account.find({ userId })

    return res.status(200).json({
        success: true,
        message: "Accounts fetched successfully",
        data: accounts
    })
})

const disconnectAccount = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { id } = req.params;

    const account = await Account.findOne({ _id: id, userId });
    if (!account) {
        return res.status(404).json({
            success: false,
            message: "Account not found",
        });
    }

    // Check how many accounts user has
    const totalAccounts = await Account.countDocuments({ userId });

    if (totalAccounts <= 1) {
        return res.status(400).json({
            success: false,
            message: "You cannot disconnect your only login method",
        });
    }

    await Account.deleteOne({ _id: id });

    return res.status(200).json({
        success: true,
        message: "Account disconnected successfully",
    });
});


export { listAccounts, disconnectAccount }