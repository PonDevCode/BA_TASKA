import express from 'express'
const Router = express.Router()
import { StatusCodes } from 'http-status-codes'
import { boardRouters } from './boardRoute.js'
import { columnRouters } from './columnRoute.js'
import { cardRouters } from './cardRoute.js'
import { userRouters } from './userRouter.js'
import { invitationRouters } from './invitationRoute.js'

// cheack route V1
Router.get('/status', (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'APIs v1' })
})

Router.use('/board',boardRouters)

Router.use('/column',columnRouters)

Router.use('/card',cardRouters)

Router.use('/user', userRouters) 

Router.use('/invitations', invitationRouters)    




export const APIs_V1 = Router