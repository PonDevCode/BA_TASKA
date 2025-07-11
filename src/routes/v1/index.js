import express from 'express'
const Router = express.Router()
import { StatusCodes } from 'http-status-codes'
import { boardRouters } from './boardRoute.js'
import { columnRouters } from './columnRoute.js'
import { cardRouters } from './cardRoute.js'
// cheack route V1
Router.get('/status', (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'APIs v1' })
})

Router.use('/board',boardRouters)

Router.use('/column',columnRouters)

Router.use('/card',cardRouters)


export const APIs_V1 = Router