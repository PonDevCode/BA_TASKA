const express = require('express')
import { StatusCodes } from 'http-status-codes'
import { columnService } from '../services/columnService.js'

const createController = async (req, res, next) => {
    try {
        res.status(StatusCodes.CREATED).json(await columnService.createSeviceNew(req.body))
    } catch (error) {
        next(error)
    }
}

const update = async (req, res, next) => {
    try {
        const id = req.params.id
        const updateCardId = await columnService.update(id, req.body)
        res.status(StatusCodes.OK).json(updateCardId)
    } catch (error) {
        next(error)
    }
}

const deleteItem = async (req, res, next) => {
    try {
        const id = req.params.id
        const result = await columnService.deleteItem(id)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}


export const columnControllers = {
    createController,
    update,
    deleteItem
    // getDetail
}