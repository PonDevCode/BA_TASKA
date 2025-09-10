import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'
import { ObjectId } from 'mongodb'
import { GET_DB } from '../config/mongoDB.js'
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '../utils/constants.js'
import { userModel } from './userModel.js'
import { boardModel } from './boardModel.js'
// Define Collection (name & schema)
const INVITATION_COLLECTION_NAME = 'invitations'
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  // kiểu lời mời , kết bạn , thêm thành viên vvv
  type: Joi.string().required().valid(...Object.values(INVITATION_TYPES)),

  // LỜI MỜI  LÀ BOARD THÌ SẼ LƯU THÊM DỮ LIỆU vào boardInvitation - optional

  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

// chỉ định ra những field mà chúng ta không cho phép cập nhật trong hàm update
const INVALID_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId', 'type', 'createdAt']

export const validateBeforeCrate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
export const createNewBoardInvitation = async (data) => {
  try {
    const validata = await validateBeforeCrate(data)
    const newInvitationToAdd = {
      ...validata,
      // biến đổi một số dữ liệu liên quan đến ObjectId chuẩn chỉnh
      inviterId: new ObjectId(validata.inviterId), // ép kiểu về lại object ID 
      inviteeId: new ObjectId(validata.inviteeId) // ép kiểu về lại object ID 
    }

    // nếu tồn tại dữ liệu boardInvitation thì update cho cái boardId
    if (validata.boardInvitation) {
      newInvitationToAdd.boardInvitation = {
        ...validata.boardInvitation,
        boardId: new ObjectId(validata.boardInvitation.boardId)
      }
    }
    // gọi insert thêm vào db
    return await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationToAdd )
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    return await GET_DB().collection(INVITATION_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
  } catch (error) { throw new Error(error) }
}


//Query tổng hợp (aggregate) để lấy những bản ghi invtivation( lời mời ) thuộc về một thằng user cụ thể

const findByUser = async (userId) => {
  try {
    // tìm kiếm - kiểm tra
    const queryConditions = [
      { inviteeId: new ObjectId(userId) }, // tìm theo inviteeId người được mời - chính là người đang thực hiện request này
      { _destroy: false },
    ]
    const results = await GET_DB().collection(INVITATION_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'inviterId', // người đi mời
          foreignField: '_id',
          as: 'inviter',
          pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'inviteeId', // người được mời 
          foreignField: '_id',
          as: 'invitee',
          pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
        }
      },
      {
        $lookup: {
          from: boardModel.BOARD_COLLECTION_NAME,
          localField: 'boardInvitation.boardId', // thông tin board  
          foreignField: '_id',
          as: 'board'
        }
      },
    ]).toArray()
    return results 
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

    if (data.boardInvitation) {
      data.boardInvitation = {
        ...data.boardInvitation,
        boardId: new ObjectId(data.boardInvitation.boardId)
      }
    }

    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

export const invitationModel = {
  createNewBoardInvitation,
  findOneById,
  update,
  findByUser
}