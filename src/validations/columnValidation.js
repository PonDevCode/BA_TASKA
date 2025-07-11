import Joi from "joi";
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators'

const createColumnNew = async (req, res, next) => {
    const correctCondition = Joi.object({
        boardId: Joi.string().required(),
        title: Joi.string().required().min(3).max(50).trim().strict(),
        // description: Joi.string().required().min(3).max(50).trim().strict(),
    })
    try {
        // trả về tất cả lỗi , không ngưng ngay khi gặp 1 lỗi nữa
        await correctCondition.validateAsync(req.body, { abortEarly: false ,  })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY), new Error(error).message)
    }
}

const update = async (req, res, next) => {
    const correctCondition = Joi.object({
        title: Joi.string().min(3).max(50).trim().strict(),
    })
    try {
        // trả về tất cả lỗi , không ngưng ngay khi gặp 1 lỗi nữa
        await correctCondition.validateAsync(req.body, { abortEarly: false ,  allowUnknown: true })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY), new Error(error).message)
    }
}

const deleteItem = async (req, res, next) => {
    const correctCondition = Joi.object({
        id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    })
    try {
        await correctCondition.validateAsync(req.params)
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY), new Error(error).message)
    }
}

export const columnValidation = {
    createColumnNew,
    update,
    deleteItem
}