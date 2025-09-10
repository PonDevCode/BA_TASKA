import Joi from "joi";
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'


const createNewBoardInvitation = async (req, res, next) => {
    const correctCondition = Joi.object({
        inviteeEmail: Joi.string().required(),
        boardId: Joi.string().required(),
    })
    try {
        // trả về tất cả lỗi , không ngưng ngay khi gặp 1 lỗi nữa
        await correctCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}


export const invitationValidation = {
    createNewBoardInvitation,
}