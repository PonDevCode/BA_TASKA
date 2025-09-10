import Joi from 'joi'
import { ObjectId, ReturnDocument } from 'mongodb'
import { GET_DB } from '../config/mongoDB.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'

import { BOARD_TYPES } from '../utils/constants.js'
import { columnModel } from './columnModel.js'
import { cardModel } from './cardModel.js'
import { pagingSkipValue } from '../utils/algorithms.js'
import { userModel } from './userModel.js'



// Define Collection (name & schema)
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),

  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // Admin của board
  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // những thành viên của board
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),


  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
// chỉ định những hàm mà ta không cho phép cập nhật trong hàm update()
const INVALID_UPDATE_FIELDS = ['_id', ' createdAt']

export const validateBeforeCrate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
export const createModelBoard = async (userId, data) => {
  try {
    const validate = await validateBeforeCrate(data)
    const newBoardToAdd = {
      ...validate,
      ownerIds: [new ObjectId(userId)]
    }
    return await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd)
  } catch (error) { throw new Error(error) }
}
const findOneById = async (id) => {
  try {
    return await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
  } catch (error) { throw new Error(error) }
}
const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryConditions = [
      // điều kiện 1 Board chưa bị xóa
      { _destroy: false },

      // điều kiện 2 cái thằng userID đang thực hiện request này nó phải thuộc vào 1 trong 2 cái mảng orderIds hoặc memberIds, sử dụng toán tử $all của mongodb
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } },
        ]
      }
    ]

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } },
        // sort title của board theo A-Z (mặc định sẽ bị chữ B hóa đứng trước chữ a thường (theo chuẩn mã ASCII))
        { $sort: { title: 1 } },
        // $facet để sử lý nhiều luồn trong 1 query
        {
          $facet: {
            // luồng thứ nhất queryBoards 
            'queryBoards': [
              { $skip: pagingSkipValue(page, itemsPerPage) }, // bỏ qua số lượng bản ghi của những page trước đó
              { $limit: itemsPerPage } // giới hạn tối đa số lượng bản ghi trả về trên 1 page
            ],
            // luồng 02 : query đếm tổng tất cả số lượng bản ghi board trong db và trả về
            'queryTotalBoards': [{ $count: 'countedAllBoards' }]

          }
        }
      ],
      { collection: { locale: 'en' } }
    ).toArray()

    const res = query[0]
    return {
      boads: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }

  } catch (error) { throw new Error(error) }
}
const getDetail = async (userId, boardId) => {
  try {
    const queryConditions = [
      { _id: new ObjectId(boardId) },
      { _destroy: false },
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(userId)] } },
          { memberIds: { $all: [new ObjectId(userId)] } },
        ]
      }
    ]
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      {
        $lookup: {
          from: columnModel.COLUMN_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'columns'
        }
      },
      {
        $lookup: {
          from: cardModel.CARD_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'cards'
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'ownerIds',
          foreignField: '_id',
          as: 'owners',
          // pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết 
          // $project để chỉ định vài field không muốn lấy về bằng cách gán giá trị nó bằng 0
          pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'memberIds',
          foreignField: '_id',
          as: 'members',
          // pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết 
          // $project để chỉ định vài field không muốn lấy về bằng cách gán giá trị nó bằng 0
          pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
        }
      }
    ]).toArray()

    return result[0] || null
  } catch (error) { throw new Error(error) }
}
// Đẩy một phần tử columnId vào cuối mãng ColumnOrderIds
// dùng $push trong mongodb ở trường hợp này để đẩy 1 phần tử vào cuối mãng
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $push: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}
// lấy 1 phần tử columnid ra khỏi mãng columnOrderIds
// dùng $pull trong mongodb ở trường hợp này để lấy một phần tử ra khỏi mảng rồi xóa nó đi
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $pull: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}
const update = async (id, data) => {
  console.log("🚀 ~ update ~ data:", data)
  try {
    // lọc những cái field ko cho update linh tinh
    Object.keys(data).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete data[fieldName]
      }
    })
    if (data.columnOrderIds) {
      data.columnOrderIds = data.columnOrderIds.map(_id => (new ObjectId(_id)))
    }

    if (data.memberIds) {
      data.memberIds = [new ObjectId(data.memberIds)]
    }
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}
const moveCardToDiffentColumn = async (id, data) => {
  try {

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}


const pushMemberIds = async (boardId, userId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $push: { memberIds: new ObjectId(userId) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createModelBoard,
  findOneById,
  getDetail,
  pushColumnOrderIds,
  update,
  moveCardToDiffentColumn,
  pullColumnOrderIds,
  getBoards,
  pushMemberIds
}