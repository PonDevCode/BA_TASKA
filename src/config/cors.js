import { WHITELIST_DOMAINS } from '../utils/constants.js'
import { env } from './environment.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

// Cấu hình CORS Option trong dự án thực tế (Video số 62 trong chuỗi MERN Stack Pro)
export const corsOptions = {
  origin: function (origin, callback) {
    // nếu môi trường là local dev thì cho qua luôn
    if (env.BUILD_MODE === 'dev' || origin === undefined) {
      return callback(null, true)
    }
    // Kiểm tra dem origin có phải là domain được chấp nhận hay không
    console.log("🚀 ~ origin:", origin)
    if ( WHITELIST_DOMAINS.includes(origin) || origin === undefined) {
      return callback(null, true)
    }
    // Cuối cùng nếu domain không được chấp nhận thì trả về lỗi
    return callback(new ApiError(StatusCodes.FORBIDDEN, `${origin} not allowed by our CORS Policy.`))
  },
  // Some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 200,

  // CORS sẽ cho phép nhận cookies từ request, (Nhá hàng :D | Ở khóa MERN Stack Advance nâng cao học trực tiếp mình sẽ hướng dẫn các bạn đính kèm jwt access token và refresh token vào httpOnly Cookies)
  credentials: true
}