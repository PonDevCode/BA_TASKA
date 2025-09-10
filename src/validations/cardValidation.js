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
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

const updated = async (req, res, next) => {
    const correctCondition = Joi.object({
        title: Joi.string().min(3).max(50).trim().strict(),
        description: Joi.string().optional(),
    })
    try {
        // trả về tất cả lỗi , không ngưng ngay khi gặp 1 lỗi nữa abortEarly
        // đối với trường hợp update , cho phép unknown để không cần đẩy 1 số field lên
        const res = await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
        console.log('res', res);
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

export const cardValidation = {
    createCardNew,
    updated
}