import express from 'express'

import { StatusCodes } from 'http-status-codes'
import { invitationService } from '../services/invitationService.js'


const createNewBoardInvitation = async (req, res, next) => {
    try {
        // user thực hiện request này chính là người inviter -> người đi mời
        const inviterId = req.jwtDecoded._id
        res.status(StatusCodes.CREATED).json(await invitationService.createNewBoardInvitation(req.body, inviterId))
    } catch (error) {
        next(error)
    }
}

const getInvitations = async (req, res, next) => {
    try {
        const id = req.jwtDecoded._id
        const result = await invitationService.getInvitations(id)
        res.status(StatusCodes.OK).json(result)
    } catch (error) {
        next(error)
    }
}

const updateBoardInvitation = async (req, res, next) => {
    try {
        const id = req.jwtDecoded._id
        const { invitationId } = req.params
        const { status } = req.body
        const resUpdateInvitation = await invitationService.updateBoardInvitation(id, invitationId, status)
        res.status(StatusCodes.OK).json(resUpdateInvitation)
    } catch (error) {
        next(error)
    }
}


export const invitationControllers = {
    createNewBoardInvitation,
    getInvitations,
    updateBoardInvitation

}