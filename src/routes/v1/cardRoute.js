const express = require('express')
import { cardControllers } from '../../controllers/cardController'
import { cardValidation } from '../../validations/cardValidation'
const Router = express.Router()

Router.route('/')
    .post(cardValidation.createCardNew, cardControllers.createController)
   



export const cardRouters = Router