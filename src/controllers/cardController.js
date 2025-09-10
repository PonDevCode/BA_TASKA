import express from 'express'

import { StatusCodes } from 'http-status-codes'
import { cardService } from '../services/cardService.js'

const createController = async (req, res, next) => {
    try {
        res.status(StatusCodes.CREATED).json(await cardService.createSeviceNew(req.body))
    } catch (error) {
        next(error)
    }
}
const updated = async (req, res, next) => {
    try {
        const id = req.params.id
        const cardCoverFile = req.file
        const userInfo = req.jwtDecoded
        console.log("🚀 ~ updated ~ userInfo:", userInfo)
        const updateCard = await cardService.update(id,req.body, cardCoverFile , userInfo)
        res.status(StatusCodes.CREATED).json(updateCard)
    } catch (error) { next(error) }
}
export const cardControllers = {
    createController,
    updated
    // getDetail
}