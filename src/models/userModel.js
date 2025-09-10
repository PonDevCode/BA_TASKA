import Joi from 'joi'
// import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'
import { ObjectId } from 'mongodb'
import { GET_DB } from '../config/mongoDB.js'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE } from '../utils/validators.js'
// Define Collection (name & schema)


const USER_ROLES = {
    CILENT: 'client',
    ADMIN: 'admin'
}
const USER_COLLECTION_NAME = 'user'
const USER_COLLECTION_SCHEMA = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: Joi.string(),
    username: Joi.string().required().trim().strict(),
    displayName: Joi.string().required().trim().strict(),
    avatar: Joi.string().default(null),
    role: Joi.string().valid(USER_ROLES.CILENT, USER_ROLES.ADMIN).default(USER_ROLES.CILENT),
    isActive: Joi.boolean().default(false),
    verifyToken: Joi.string(),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
})


const INVALID_UPDATE_FIELDS = ['_id', 'email', ' createdAt']

export const validateBeforeCrate = async (data) => {
    return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
export const createModelUser = async (data) => {
    console.log("🚀 ~ createModelUser ~ data:", data)
    try {
        const validate = await validateBeforeCrate(data)
        console.log("🚀 ~ createModelUser ~ validate:", validate)
        return await GET_DB().collection(USER_COLLECTION_NAME).insertOne({
            ...validate,
        })
    } catch (error) { throw new Error(error) }
}
const findOneById = async (id) => {
    try {
        return await GET_DB().collection(USER_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    } catch (error) { throw new Error(error) }
}

const findOneByIdEmail = async (emailValue) => {
    try {
        return await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email: emailValue })
    } catch (error) { throw new Error(error) }
}
const update = async (id, data = {}) => {
    try {
        // lọc những cái field ko cho update linh tinh

        Object.keys(data).forEach(fieldName => {
            if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
                delete data[fieldName]
            }
        })

        // đổi với những dữ liệu liên quan object id biến đổi nó ở đây (tùy sau này nếu thì dùng function riêng)
        // if(data.columnId) data.columnId = new ObjectId(data.columnId)


        const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: data },
            { returnDocument: 'after' }
        )
        return result
    } catch (error) { throw new Error(error) }
}
// const deleteManyByColumnId = async (ColumnId) => {
//   try {
//     const result = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({ columnId: new ObjectId(ColumnId) })

//     console.log("🚀 ~ deleteManyByColumnId ~ result:", result)

//     return result
//   } catch (error) { throw new Error(error) }
// }
export const userModel = {
    USER_COLLECTION_NAME,
    USER_COLLECTION_SCHEMA,
    createModelUser,
    findOneById,
    findOneByIdEmail,
    update

}