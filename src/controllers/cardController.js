const express = require('express')
import { StatusCodes } from 'http-status-codes'
import { cardService } from '../services/cardService.js'

const createController = async(req, res, next) => {
    try {
        res.status(StatusCodes.CREATED).json(await cardService.createSeviceNew(req.body))
    } catch (error) {
        next(error)
    }
}
export const cardControllers = {
    createController,
    // getDetail
}