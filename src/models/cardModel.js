import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE, EMAIL_RULE, EMAIL_RULE_MESSAGE } from '../utils/validators.js'
import { ObjectId } from 'mongodb'
import { GET_DB } from '../config/mongoDB.js'
// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  cover: Joi.string().default(null),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  comments: Joi.array().items({
    userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    userAvatar: Joi.string(),
    useDisplayName: Joi.string(),
    conetnt: Joi.string(),
    // chỗ này lưu ý vì dùng hàm push đẻ thêm comment nên sẽ ko set default date.now() được 

    commenteAdt: Joi.date().timestamp()
  }).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})


const INVALID_UPDATE_FIELDS = ['_id', ' createdAt']

export const validateBeforeCrate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
export const createModelCard = async (data) => {
  try {
    const validate = await validateBeforeCrate(data)
    return await GET_DB().collection(CARD_COLLECTION_NAME).insertOne({
      ...validate,
      boardId: new ObjectId(validate.boardId), // ép kiểu về lại object ID 
      columnId: new ObjectId(validate.columnId) // ép kiểu về lại object ID 
    })
  } catch (error) { throw new Error(error) }
}
const findOneById = async (id) => {
  try {
    return await GET_DB().collection(CARD_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
  } catch (error) { throw new Error(error) }
}
const update = async (id, data) => {
  try {
    // lọc những cái field ko cho update linh tinh

    Object.keys(data).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete data[fieldName]
      }
    })

    // đổi với những dữ liệu liên quan object id biến đổi nó ở đây (tùy sau này nếu thì dùng function riêng)
    if (data.columnId) data.columnId = new ObjectId(data.columnId)
    if (data.boardId) data.boardId = new ObjectId(data.boardId)



    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}
const deleteManyByColumnId = async (ColumnId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({ columnId: new ObjectId(ColumnId) })
    console.log("🚀 ~ deleteManyByColumnId ~ result:", result)
    return result
  } catch (error) { throw new Error(error) }
}


/**
 * Đẩy một comment vào đầu mảng comments ? 
 * trong JS Ngược lại push (thêm phần tử vào cuối mảng ) sẽ là unshift (thêm phần tử vào đầu mảng)
 * nhưng trong moogodb hiện tại chỉ có push - mặt định đẩy phần tử vào cuối mảng.
 * dĩ nhiên cứ lưu comment vào cuối mảng cũng được , nhưng nên học cách để thêm phần tử vào đầu mảng trong 
 * moongobd
 * vẫn dùng push , nhưng ta bọc data vào array để trong $each và chỉ định position:0
 */

const unshiftNewComment = async (id, commentData) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $push: { comments: { $each: [commentData], $position: 0 } } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}
export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createModelCard,
  findOneById,
  update,
  deleteManyByColumnId,
  unshiftNewComment
}