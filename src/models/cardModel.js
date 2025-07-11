import Joi, { object } from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongoDB'
// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})


const INVALID_UPDATE_FIELDS = ['_id',' createdAt']

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
const update = async (id , data) => {
  try {
    // lọc những cái field ko cho update linh tinh
    
    Object.keys(data).forEach(fieldName => {
      if(INVALID_UPDATE_FIELDS.includes(fieldName)){
        delete data[fieldName]
      }
    })

    // đổi với những dữ liệu liên quan object id biến đổi nó ở đây (tùy sau này nếu thì dùng function riêng)
    if(data.columnId) data.columnId = new ObjectId(data.columnId)
    
    
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data},
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
export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createModelCard,
  findOneById,
  update,
  deleteManyByColumnId
}