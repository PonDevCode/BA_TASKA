import express from 'express'
import { columnControllers } from '../../controllers/columnController.js'
import { columnValidation } from '../../validations/columnValidation.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'

const Router = express.Router()
Router.route('/')
    .post(authMiddleware.isAuthorized,columnValidation.createColumnNew, columnControllers.createController)
Router.route('/:id')
    .put(authMiddleware.isAuthorized,columnValidation.update, columnControllers.update)
    .delete(authMiddleware.isAuthorized,columnValidation.deleteItem, columnControllers.deleteItem)





export const columnRouters = Router