const express = require('express')
import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createController = async(req, res, next) => {
    try {
        const createBoard = await boardService.createSeviceNew(req.body)
        res.status(StatusCodes.CREATED).json(createBoard)
    } catch (error) {
        next(error)
    }
}

const getDetail = async(req, res, next) => {
    try {
        const id = req.params.id
        console.log('id', id);
        
        const board = await boardService.getDetail(id)
        res.status(StatusCodes.OK).json(board)
    } catch (error) {
        next(error)
    }
}
const update = async(req, res, next) => {
    try {
        const id = req.params.id
        const updateBoardId = await boardService.update(id, req.body)
        res.status(StatusCodes.OK).json(updateBoardId)
    } catch (error) {
        next(error)
    }
}

const moveCardToDiffentColumn = async (req, res, next) => {
    try {
        const result = await boardService.moveCardToDiffentColumn( req.body)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}
export const boardControllers = {
    createController,
    getDetail,
    update,
    moveCardToDiffentColumn
}