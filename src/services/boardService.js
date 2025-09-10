import { StatusCodes } from "http-status-codes"
import { boardModel } from "../models/boardModel.js"
import { columnModel } from "../models/columnModel.js"
import { cardModel } from "../models/cardModel.js"

import ApiError from "../utils/ApiError.js"
import { slugify } from "../utils/formatter.js"
import lodash from 'lodash'
import { DEFAULT_PAGE , DEFAULT_ITEMS_PER_PAGE } from "../utils/constants.js"
const { cloneDeep } = lodash




const getBoards = async (userId, page , itemsPerPage) => {
    try {
        if(!page) page = DEFAULT_PAGE
        if(!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE
        
        const result = await boardModel.getBoards(userId, parseInt(page, 10) , parseInt(itemsPerPage, 10))

        return result
    } catch (error) { next(error)}
}
const getDetail = async (userId,boardId) => {
    try {
        const board = await boardModel.getDetail(userId,boardId)
        if (!board) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Board Not Found')
        }
        // cooking data
        // b1 clone lại Board
        const cloneBoard = cloneDeep(board)
        // b2 đẩy card về đúng column của nó 
        cloneBoard.columns.forEach(column => {
            // equals hàm của mongodb hỗ trợ
            column.cards = cloneBoard.cards.filter(card => card.columnId.equals(column._id))

            // toString hàm của js
            // tìm ra cái card có cái columnsId === column._id => gán nó vào mãng card mới của columns
            // column.cards = cloneBoard.cards.filter(card => card.columnId?.toString() === column._id?.toString())
        })
        // b3 xóa Collection cards ko để nó song song với columns
        delete cloneBoard.cards
        return cloneBoard
    } catch (error) { throw error }
}
const createSeviceNew = async (userId,data) => {
    try {

        const newBoard = {
            ...data,
            slug: slugify(data.title)
        }
        const result = await boardModel.createModelBoard(userId,newBoard)
        const getSeviceBoard = await boardModel.findOneById(result.insertedId.toString())
        return getSeviceBoard
    } catch (error) { throw error }
}
const update = async (id, data) => {
    try {
        const updateData = {
            ...data,
            updatedAt: Date.now(),
            _id: '342342342',
            createdAt: 'sdfsdfsd'
        }
        const result = await boardModel.update(id, updateData)
        console.log('result', result);

        return result
    } catch (error) { throw error }
}
const moveCardToDiffentColumn = async (data) => {
    try {

        // b1: cập nhật mảng cardOrderIds của column ban đầu chứ nó ( hiểu bản chất là xóa đi cái _id của card ra khỏi mảng)
        await columnModel.update(data.prevColumnId, {
            cardOrderIds: data.prevCardOrderIds,
            updatedAt: Date.now()
        })
        // b2: cập nhật mảng cardOrderIds của column tiếp theo ( hiểu bản chất là thêm _id của card vào mãng ) 
        await columnModel.update(data.nextColumnId, {
            cardOrderIds: data.nextCardOrderIds,
            updatedAt: Date.now()
        })
        // b3: cập nhật lại trường columnId của cái card đã kéo 
        await cardModel.update(data.currentCardId, {
            columnId: data.nextColumnId
        })

        return { update: 'success fully' }
    } catch (error) { throw error }
}
export const boardService = {
    createSeviceNew,
    getDetail,
    update,
    moveCardToDiffentColumn,
    getBoards
}