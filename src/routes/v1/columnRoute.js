const express = require('express')
import { StatusCodes } from 'http-status-codes'
import { columnControllers } from '../../controllers/columnController.js'
import { columnValidation } from '../../validations/columnValidation.js'

const Router = express.Router()
Router.route('/')
    .post(columnValidation.createColumnNew, columnControllers.createController)

Router.route('/:id')
    .put(columnValidation.update, columnControllers.update)
    .delete(columnValidation.deleteItem, columnControllers.deleteItem)





export const columnRouters = Router