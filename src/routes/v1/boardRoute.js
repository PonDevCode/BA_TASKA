import express from 'express'

import { StatusCodes } from 'http-status-codes'
import { boardControllers } from '../../controllers/boardController.js'
import { boardValidation } from '../../validations/boardValidation.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
const Router = express.Router()
Router.route('/')
    .get(authMiddleware.isAuthorized, boardControllers.getBoards)
    .post(authMiddleware.isAuthorized, boardValidation.createNew, boardControllers.createController)

Router.route('/:id')
    .get(authMiddleware.isAuthorized, boardControllers.getDetail)
    .put(authMiddleware.isAuthorized, boardValidation.update, boardControllers.update)

Router.route('/supports/moving_card')
    .put(authMiddleware.isAuthorized, boardValidation.moveCardToDiffentColumn, boardControllers.moveCardToDiffentColumn)

export const boardRouters = Router