import express from 'express'

import { StatusCodes } from 'http-status-codes'
import { userControllers } from '../../controllers/userController.js'
import { userValidation } from '../../validations/userValidation.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { multerUploadMiddleware } from '../../middlewares/multerUploadMiddleware.js'

const Router = express.Router()
Router.route('/register')
    .post(userValidation.createUser, userControllers.createUser)

Router.route('/verify')
    .put(userValidation.verifyAccount, userControllers.verifyAccount)

Router.route('/login')
    .post(userValidation.login, userControllers.login)

Router.route('/logout')
    .delete(userControllers.logout)

Router.route('/refresh_token')
    .get(userControllers.refreshToken)

Router.route('/update')
    .put(
        authMiddleware.isAuthorized,
        multerUploadMiddleware.upload.single('avatar'),
        userValidation.update,
        userControllers.update)

Router.route('/refresh_token')
    .get(userControllers.refreshToken)

export const userRouters = Router