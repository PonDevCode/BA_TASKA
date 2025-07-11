import { cardModel } from "../models/cardModel.js"
import { columnModel } from "../models/columnModel.js"
const createSeviceNew = async (data) => {
    try {
        const newCard = {
            ...data
        }
        const result = await cardModel.createModelCard(newCard)
        const getSeviceCard = await cardModel.findOneById(result.insertedId.toString())
        if(getSeviceCard){
            await columnModel.pushCardOrderIds(getSeviceCard)
        }
        return getSeviceCard 
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
export const cardService = {
    createSeviceNew,
    // getDetail
}