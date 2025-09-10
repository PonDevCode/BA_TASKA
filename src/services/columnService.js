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

export const columnService = {
    createSeviceNew,
    update,
    deleteItem

}