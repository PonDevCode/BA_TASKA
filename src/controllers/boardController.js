import express from 'express'

import { StatusCodes } from 'http-status-codes'
import { boardService } from '../services/boardService.js'


const getBoards = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded._id

        const { page, itemsPerPage } = req.query
        const result = await boardService.getBoards(userId, page, itemsPerPage)

        res.status(StatusCodes.OK).json(result)
    } catch (error) { next(error) }
}

const getDetail = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded._id
        const boardId = req.params.id

        const board = await boardService.getDetail(userId, boardId)
        res.status(StatusCodes.OK).json(board)

    } catch (error) {
        next(error)
    }
}
const createController = async (req, res, next) => {
    try {
        const userId = req.jwtDecoded._id
        const createBoard = await boardService.createSeviceNew(userId,req.body,)
        res.status(StatusCodes.CREATED).json(createBoard)
    } catch (error) {
        next(error)
    }
}
const update = async (req, res, next) => {
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
        const result = await boardService.moveCardToDiffentColumn(req.body)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}
export const boardControllers = {
    createController,
    getDetail,
    update,
    moveCardToDiffentColumn,
    getBoards
}