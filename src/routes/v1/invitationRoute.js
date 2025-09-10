import express from 'express'


import { invitationControllers } from '../../controllers/invitationController.js'
import { invitationValidation } from '../../validations//invitationValidation.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'


const Router = express.Router()


Router.route('/board')
    .post(authMiddleware.isAuthorized,
        invitationValidation.createNewBoardInvitation,
        invitationControllers.createNewBoardInvitation)

// get invitation by user
Router.route('/')
    .get(authMiddleware.isAuthorized, invitationControllers.getInvitations)

    // cập nhật một bản ghi board invitation
Router.route('/board/:invitationId')
    .put(authMiddleware.isAuthorized, invitationControllers.updateBoardInvitation)


export const invitationRouters = Router