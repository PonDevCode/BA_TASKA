import { CloudinaryProvider } from "../providers/CloundinaryProvider.js"
import { cardModel } from "../models/cardModel.js"
import { columnModel } from "../models/columnModel.js"
const createSeviceNew = async (data) => {
    try {
        const newCard = {
            ...data
        }
        const result = await cardModel.createModelCard(newCard)
        const getSeviceCard = await cardModel.findOneById(result.insertedId.toString())
        if (getSeviceCard) {
            await columnModel.pushCardOrderIds(getSeviceCard)
        }
        return getSeviceCard
    } catch (error) { throw error }
}
const update = async (id, data, cardCoverFile , userInfo) => {
    try {
        const updateData = {
            ...data,
            updatedAt: Date.now(),
        }
        let updatedCard = {}

        if (cardCoverFile) {
            const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'cards')
            // lưu url vào dtb
            updatedCard = await cardModel.update(id, {
                cover: uploadResult.secure_url
            })
        }else if(updateData.commentToAdd){
            // tạo dữ liệu comments thêm vào dtb, cần bổ sung thêm những field cần thiết
            const commentData = {
                ...updateData.commentToAdd,
                commentdAt: Date.now(),
                userId: userInfo._id,
                userEmail: userInfo.email
            }
            // unshift đối ngược với put
            updatedCard = await cardModel.unshiftNewComment(id,commentData)
        } else {
            updatedCard = await cardModel.update(id, updateData)
        }
            console.log("🚀 ~ update ~ updatedCard:", updatedCard)

        return updatedCard

    } catch (error) { throw error }
}
export const cardService = {
    createSeviceNew,
    update
}