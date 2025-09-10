import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";
import { userModel } from "../models/userModel.js";
import bcrypt from 'bcrypt'
import { env } from '../config/environment.js'
import { JwtProvider } from "../providers/JwtProvider.js";
import { v4 as uuidv4 } from 'uuid';
import { WEBSITE_DOMAIN } from "../utils/constants.js";

import { ResendProvider } from "../providers/ResendProvider.js";
import { pickUser } from "../utils/pickUser.js";
import { CloudinaryProvider } from "../providers/CloundinaryProvider.js";

const createSeviceUser = async (data) => {
    try {
        console.log(data);
        // kiểm tra email đã tồn tại trong hệ thống chưa 
        const existUser = await userModel.findOneByIdEmail(data.email)

        if (existUser) {
            throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
        }
        // tạo data lưu vào Database 
        // nameFormEmail: pondevcode@gmail.com thì sẽ lấy được "pondevcode" split tách phần tử
        const nameFormEmail = data.email.split('@')[0]
        const newUser = {
            email: data.email,
            password: await bcrypt.hash(data.password, 8),
            // password: bcrypt.hash(data.password, 8),
            username: nameFormEmail,
            displayName: nameFormEmail, // mặt định để giống username khi user đăng ký mới, để sau làm tính năng update cho user
            verifyToken: uuidv4()
        }

        // thực hiện lưu thông tin user vào dtb
        const result = await userModel.createModelUser(newUser)
        const getNewUser = await userModel.findOneById(result.insertedId.toString())

        // Gửi email xác thực tài khoản 

        const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
        const subject = 'Taska : Please verify your email before using our service!'

        const html = `
            <h3>here is your verification link:</h3>
            <h3>${verificationLink}</h3>
            <h3>Sincerely, <br/> - Pon dev code athour</h3>
        `
        const to = getNewUser.email
        // Gọi tới Provider gửi email
        // const sendEmailResponse = await ResendProvider.sendEmail({to,subject,html})
        await ResendProvider.sendEmail({ to, subject, html })
        // console.log("🚀 ~ createSeviceUser ~ sendEmailResponse:", sendEmailResponse)
        // const sendEmailMailerSend = await MailersendProvider.sendEmail({to,subject,html})

        // console.log("🚀 ~ createSeviceUser ~ sendEmailMailerSend:", sendEmailMailerSend)

        // return trả về dữ liệu cho phía controller 
        return getNewUser
    } catch (error) { throw error }
}

const verifyAccount = async (data) => {
    try {
        // Query user trong dtb
        const existsUser = await userModel.findOneByIdEmail(data.email)

        // các bước kiểm tra cần thiết
        if (!existsUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
        if (existsUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is alrealy active ')
        if (data.token !== existsUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid ')

        // nếu như mọi thứ oke , bắt đầu update lại thông tin của thằng user để verify account

        const updateData = {
            isActive: true,
            verifyToken: null
        }

        const updatedUser = await userModel.update(existsUser._id, updateData)

        return pickUser(updatedUser)
    } catch (error) { throw error }
}

const login = async (data) => {
    try {
        // Query user trong dtb
        const existsUser = await userModel.findOneByIdEmail(data.email)

        // các bước kiểm tra cần thiết
        if (!existsUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
        if (!existsUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active')

        // kiểm tra mật khẩu
        if (!bcrypt.compareSync(data.password, existsUser.password)) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your email or password is incorrect!')
        }

        // mọi thứ oke thì bắt đầu tạo token đăng nhập để trả về fontend

        // tạo thông tin sẽ đính kèm trong jwt token bao gồm _id và email của user
        const userInfo = { _id: existsUser._id, email: existsUser.email }
        // tạo 2 loại token , accessToken , và refreshtoken để trả về cho phía FE
        const accessToken = await JwtProvider.generateToken(
            userInfo,
            env.ACCESS_TOKEN_SECRET_SIGNATURE,
            env.ACCESS_TOKEN_LIFE
        )

        const refreshToken = await JwtProvider.generateToken(
            userInfo,
            env.REFRESH_TOKEN_SECRET_SIGNATURE,
            env.REFRESH_TOKEN_LIFE
        )

        // trả về thông tin của user kèm theo 2 cái token vừa tạo ra

        return { accessToken, refreshToken, ...pickUser(existsUser) }

    } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
    try {
        // Verify / giải mã cái refreshToken  xem có hợp lệ hay không
        const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)
        // đoạn này chỉ lưu những thông tin unique và cố định của user trong token rồi , có thể lấy luôn từ decoded ra , tiết kiệm query vào db lấy data mới
        const userInfo = {
            _id: refreshTokenDecoded._id,
            email: refreshTokenDecoded.email
        }
        // tạo accessToken mới
        const accessToken = await JwtProvider.generateToken(
            userInfo,
            env.ACCESS_TOKEN_SECRET_SIGNATURE,
            env.ACCESS_TOKEN_LIFE
        )
        return { accessToken }
    } catch (error) { throw error }
}

const update = async (id, data,userAvatarFile) => {
   
    try {
        // query user và kiểm tra 
        const existUser = await userModel.findOneById(id)
        if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
        if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your acount is not active')

        // Khởi tạo kết quả update user ban đầu là empty
        let updatedUser = {}

        // trường hợp change password
        if (data?.current_password && data?.new_password) {
            // kiểm tra xem current_password có đúng hay không
            if (!bcrypt.compareSync(data.current_password, existUser.password)) {
                throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your email or current_password is incorrect!')
            }
            // nếu như current password đúng thì chúng ta sẽ hash một cái mật khẩu mới và update lại vào DB
            updatedUser = await userModel.update(existUser._id, {
                password: await bcrypt.hash(data.new_password, 8),
            })
        }else if (userAvatarFile) {
            // trường hợp upload file lên cloud storage , cụ thể là cloudinary
    
            const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer,'users')
    

            // lưu url vào dtb
            updatedUser = await userModel.update(existUser._id, {
                avatar : uploadResult.secure_url
            })

        } else {
            // trường hợp update các thông tin chung (displayName,....)
            updatedUser = await userModel.update(existUser._id, data)
        }
        return pickUser(updatedUser)


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
export const userService = {
    createSeviceUser,
    verifyAccount,
    login,
    refreshToken, 
    update
    // getDetail
}