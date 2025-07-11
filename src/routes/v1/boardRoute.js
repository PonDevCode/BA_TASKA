import express from 'express'

import { StatusCodes } from 'http-status-codes'
import { boardControllers } from '../../controllers/boardController.js'
import { boardValidation } from '../../validations/boardValidation.js'
const Router = express.Router()
Router.route('/')
    .get((req, res) => {
        res.status(StatusCodes.OK).json({ message: 'Note : API get list board' })
    })
    .post(boardValidation.createNew, boardControllers.createController)

Router.route('/:id')
    .get(boardControllers.getDetail)
    .put(boardValidation.update , boardControllers.update)
    
Router.route('/supports/moving_card')
    .put(boardValidation.moveCardToDiffentColumn , boardControllers.moveCardToDiffentColumn)

export const boardRouters = Router