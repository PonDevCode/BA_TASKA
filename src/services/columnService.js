import { StatusCodes } from "http-status-codes"
import ApiError from "../utils/ApiError.js"
import { columnModel } from "../models/columnModel.js"
import { boardModel } from "../models/boardModel.js"
import { cardModel } from "../models/cardModel.js"
const createSeviceNew = async (data) => {
    try {
        const newColumn = {
            ...data
        }
        const result = await columnModel.createModelColumn(newColumn)
        const getSeviceColumn = await columnModel.findOneById(result.insertedId.toString())
        if (getSeviceColumn) {
            getSeviceColumn.cards = []
            // gọi api board push column vừa tạo vào columOrderIds
            await boardModel.pushColumnOrderIds(getSeviceColumn)
        }
        return getSeviceColumn
    } catch (error) { throw error }
}

const update = async (id, data) => {
    try {
        const updateData = {
            ...data,
            updatedAt: Date.now(),
        }
        const result = await columnModel.update(id, updateData)
        return result
    } catch (error) { throw error }
}


const deleteItem = async (id) => {
    try {
        const targetColumn = await columnModel.findOneById(id)
        console.log("🚀 ~ deleteItem ~ targetColumn:", targetColumn)
        if (!targetColumn) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Board Not Found')
        }
        // xóa column 
        await columnModel.deleteOneById(id)
        // xóa toàn bộ card thuộc cái column ở trên 
        await cardModel.deleteManyByColumnId(id)

        // xóa columnId trong mảng columnOrderIds của cái board chứa nó     
        await boardModel.pullColumnOrderIds(targetColumn)

        return { deleteResult: 'Column and its Cards deleted successfully!' }
    } catch (error) { throw error }
}
// const getDetail = async (id) => {
//     try {
//         const board = await boardModel.getDetail(id)
//         if (!board) {
//             throw new ApiError(StatusCodes.NOT_FOUND, 'Board Not Found')
//         }
//         // cooking data
//         // b1 clone lại Board
//         const cloneBoard = cloneDeep(board)
//         // b2 đẩy card về đúng column của nó 
//         cloneBoard.columns.forEach(column => {
//             // equals hàm của mongodb hỗ trợ
//             column.cards = cloneBoard.cards.filter(card => card.columnId.equals(column._id))

//             // toString hàm của js
//             // tìm ra cái card có cái columnsId === column._id => gán nó vào mãng card mới của columns
//             // column.cards = cloneBoard.cards.filter(card => card.columnId?.toString() === column._id?.toString())
//         })
//         // b3 xóa Collection cards ko để nó song song với columns
//         delete cloneBoard.cards
//         return cloneBoard
//     } catch (error) { throw error }
// }
export const columnService = {
    createSeviceNew,
    update,
    deleteItem
    // getDetail
}