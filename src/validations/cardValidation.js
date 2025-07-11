import Joi from "joi";
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'


const createCardNew = async (req, res, next) => {
    const correctCondition = Joi.object({
        boardId: Joi.string().required(),
        columnId: Joi.string().required(),
        title: Joi.string().required().min(3).max(50).trim().strict()
    })
    try {
        // trả về tất cả lỗi , không ngưng ngay khi gặp 1 lỗi nữa
        const res = await correctCondition.validateAsync(req.body, { abortEarly: false })
        console.log('res', res);
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY), new Error(error).message)
    }
}

export const cardValidation = {
    createCardNew
}