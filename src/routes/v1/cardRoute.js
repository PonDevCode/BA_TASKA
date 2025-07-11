import express from 'express'

import { cardControllers } from '../../controllers/cardController.js'
import { cardValidation } from '../../validations/cardValidation.js'
const Router = express.Router()

Router.route('/')
    .post(cardValidation.createCardNew, cardControllers.createController)
   



export const cardRouters = Router