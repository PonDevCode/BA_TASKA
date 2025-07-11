import { env } from "./environment";
import { MongoClient, ServerApiVersion } from 'mongodb'

let taskaDatabaseInstance = null

const mongoClientInstance = new MongoClient(
    env.MONGODB_URL,
    {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
)
export const CONNECT_DB = async ( ) =>{
    await mongoClientInstance.connect()
    taskaDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

export const GET_DB = () => {
    if(!taskaDatabaseInstance) throw new Error('Hẫy kết nối cơ sở dữ liệu trước / Must connect to database first?')
    return taskaDatabaseInstance
}

export const CLOSE_DB = async() => {
    await mongoClientInstance.close()
}