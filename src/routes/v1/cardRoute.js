import express from 'express'

import { cardControllers } from '../../controllers/cardController.js'
import { cardValidation } from '../../validations/cardValidation.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'
import { multerUploadMiddleware } from '../../middlewares/multerUploadMiddleware.js'

const Router = express.Router()

Router.route('/')
    .post(authMiddleware.isAuthorized, cardValidation.createCardNew, cardControllers.createController)

Router.route('/:id')
    .put(
        authMiddleware.isAuthorized,
        multerUploadMiddleware.upload.single('cover'),
        cardValidation.updated,
        cardControllers.updated
    )

export const cardRouters = Router