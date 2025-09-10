import express from 'express'

import { StatusCodes } from 'http-status-codes'
import { userService } from '../services/userSevice.js'
import ms from 'ms'
import ApiError from '../utils/ApiError.js'



const createUser = async (req, res, next) => {
    try {
        res.status(StatusCodes.CREATED).json(await userService.createSeviceUser(req.body))
    } catch (error) {
        next(error)
    }
}

const verifyAccount = async (req, res, next) => {
    try {
        res.status(StatusCodes.CREATED).json(await userService.verifyAccount(req.body))
    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const result = await userService.login(req.body)
        // xử lý trả về HTTP only cookie cho phía trình duyệt
        /**
         * đối với maxAge - thời gian sống của Cookie thì chúng ta sẽ tối đa 14 ngày , tùy dự án thời gian sống của cookie khác với thời gian 
         * sống của token
         */
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: ms('14 days')
        })

        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: ms('14 days')
        })
        res.status(StatusCodes.CREATED).json(result)
    } catch (error) {
        next(error)
    }
}

const logout = async (req, res, next) => {
    try {
        // xóa cookie - làm ngược lại so với gán cookie của hàm login
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')

        res.status(StatusCodes.OK).json({ loggedOut: true })
    } catch (error) { next(error) }
}

const refreshToken = async (req, res, next) => {
    try {
        const result = await userService.refreshToken(req.cookies?.refreshToken)
        res.cookie('accessToken', result.accessToken,
            {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: ms('14 days')
            })
        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(new ApiError(StatusCodes.UNAUTHORIZED, 'Please Sign In!')) }
}

const update = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded._id
        const userAvatarFile = req.file
        const updateUser = await userService.update(userId, req.body, userAvatarFile)
        res.status(StatusCodes.OK).json(updateUser)
    } catch (error) { next(error) }
}
// const update = async (req, res, next) => {
//     try {
//         const id = req.params.id
//         const updateCardId = await columnService.update(id, req.body)
//         res.status(StatusCodes.OK).json(updateCardId)
//     } catch (error) {
//         next(error)
//     }
// }

// const deleteItem = async (req, res, next) => {
//     try {
//         const id = req.params.id
//         const result = await columnService.deleteItem(id)
//         res.status(StatusCodes.OK).json(result)
//     } catch (error) {
//         next(error)
//     }
// }


export const userControllers = {
    createUser,
    verifyAccount,
    login,
    logout,
    refreshToken,
    update

}