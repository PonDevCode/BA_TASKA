import Joi from "joi";
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'
import { BOARD_TYPES } from "../utils/constants.js";
import { FIELD_REQUIRED_MESSAGE, EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '../utils/validators.js'

const createUser = async (req, res, next) => {
    const correctCondition = Joi.object({
        email: Joi.string().required().min(3).max(50).trim().strict(),
        password: Joi.string().required().min(3).max(50).trim().strict(),
    })
    try {
        // trả về tất cả lỗi , không ngưng ngay khi gặp 1 lỗi nữa
        await correctCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

const verifyAccount = async (req, res, next) => {
    const correctCondition = Joi.object({
        email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
        token: Joi.string().required()
    })
    try {
        // trả về tất cả lỗi , không ngưng ngay khi gặp 1 lỗi nữa
        await correctCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

const login = async (req, res, next) => {
    const correctCondition = Joi.object({
        email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
        password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),
    })
    try {
        // trả về tất cả lỗi , không ngưng ngay khi gặp 1 lỗi nữa
        await correctCondition.validateAsync(req.body, { abortEarly: false })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

const update = async (req, res, next) => {
    const correctCondition = Joi.object({
        displayName: Joi.string().trim().strict(),
        current_password: Joi.string().pattern(PASSWORD_RULE).message(`current_password: ${PASSWORD_RULE_MESSAGE}`),
        new_password: Joi.string().pattern(PASSWORD_RULE).message(`new_password: ${PASSWORD_RULE_MESSAGE}`),
    })
    try {
        // lưu ý đối với trường hợp update , cho phép unknow để không cần đẩy 1 số field lên
        await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

// const update = async (req, res, next) => {
//     const correctCondition = Joi.object({
//         title: Joi.string().min(3).max(50).trim().strict(),
//         description: Joi.string().min(3).max(50).trim().strict(),
//         type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE),
//     })
//     try {
//         // trả về tất cả lỗi , không ngưng ngay khi gặp 1 lỗi nữa
//         await correctCondition.validateAsync(req.body, {
//             abortEarly: false,
//             allowUnknown: true  // đối với trường hợp update , cho phép unknown để không cần đẩy một số field lên   
//         })
//         next()
//     } catch (error) {
//         next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
//     }
// }


// const moveCardToDiffentColumn = async (req, res, next) => {
//     const correctCondition = Joi.object({
//         currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
//         prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
//         prevCardOrderIds: Joi.array().required().items(
//             Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
//         ),
//         nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
//         nextCardOrderIds: Joi.array().required().items(
//             Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
//         )
//     })
//     try {
//         // trả về tất cả lỗi , không ngưng ngay khi gặp 1 lỗi nữa
//         await correctCondition.validateAsync(req.body, { abortEarly: false, })
//         next()
//     } catch (error) {
//         next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
//     }
// }

export const userValidation = {
    createUser,
    verifyAccount,
    login,
    update,
    // moveCardToDiffentColumn
}