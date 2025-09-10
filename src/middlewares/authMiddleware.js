import { StatusCodes } from "http-status-codes";
import { JwtProvider } from "../providers/JwtProvider.js";
import { env } from "../config/environment.js";
import ApiError from "../utils/ApiError";



// middleware này sẽ đảm nhận xác thực jwt accesstoken nhận được từ fe có hợp lệ hay không

const isAuthorized = async (req, res, next) => {
    // Lấy accessToken nằm trong request cookie phía clent - withCredentials trong file authorizeAxios
    const clientAccessToken = req.cookies?.accessToken
    // nếu clientAccessToken koo tồn tại trả về lỗi luôn
    if (!clientAccessToken) {
        next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
        return
    }
    try {
        //  b1 : Thực hiện giải mã token xem có hợp lệ hay hong
        const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
        // b2 : QT : nếu cái token hợp lệ thì sẽ cần phải lưu thông tin giải mã được vào cái req.jwtDecoded, để sử dụng cho các tầng cần sử lý ở phía sao
        req.jwtDecoded = accessTokenDecoded
        // b3 cho phép cái request đi tiếp  
        next()
    } catch (error) {
        // nếu cái accessToken bị hết hạn (expired) thì mình cần trả về một cái mã lỗi cho phía FE biết để gọi api refresh token
        if(error?.message.includes('jwt expired')){
            next(new ApiError(StatusCodes.GONE, 'Need to refresh token'))
            return
        }
        // nếu cái accessToken nó không hợp lệ do bất cứ điều dì khác vụ hết hạn thì trả về thẳng mã 401 cho phía FE gọi api sign_out 
        next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
        return
    }
}

export const authMiddleware = { isAuthorized }