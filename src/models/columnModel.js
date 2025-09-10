import Joi from 'joi'
import { GET_DB } from '../config/mongoDB.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'
import { ObjectId } from 'mongodb'
// Define Collection (name & schema)
const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),

  cardOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const INVALID_UPDATE_FIELDS = ['_id',' createdAt']
export const validateBeforeCrate = async (data) => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
export const createModelColumn = async (data) => {
  try {
    const validate = await validateBeforeCrate(data)
    return await GET_DB().collection(COLUMN_COLLECTION_NAME).insertOne({
      ...validate,
      boardId: new ObjectId(validate.boardId) // ép kiểu về lại object ID 
    })
  } catch (error) { throw new Error(error) }
}
const findOneById = async (id) => {
  try {
    return await GET_DB().collection(COLUMN_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
  } catch (error) { throw new Error(error) }
}

const pushCardOrderIds = async (card) => {
  try {
    console.log('card', card);

    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(card.columnId) },
      { $push: { cardOrderIds: new ObjectId(card._id) } },
      { returnDocument: 'after' }
    )
    return result
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
    // đổi với những dữ liệu liên quan objectId biến đổi ở đây

    if(data.cardOrderIds) {
      data.cardOrderIds = data.cardOrderIds.map( _id => (new ObjectId(_id)))
    }
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data},
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const deleteOneById = async (id) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).deleteOne({ _id: new ObjectId(id)})
    return result
  } catch (error) { throw new Error(error) }
} 
export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA, 
  findOneById,
  createModelColumn,
  pushCardOrderIds,
  update,
  deleteOneById

}