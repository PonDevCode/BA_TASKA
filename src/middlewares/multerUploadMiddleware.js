import multer from "multer";
import { ALLOW_COMMON_FILE_TYPES ,LIMIT_COMMON_FILE_SIZE} from "../utils/validators";


const customFileFilter = (req, file, callback) => {
    // console.log("🚀 ~ customFileFilter ~ file:", file)


    // đối với multer kiểm tra kiểu file thì sử dụng mimetype
    if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
        const erMessage = 'File type is invalid. Only accept jpg, jpeg and png'
        return callback(erMessage, null)
    }
    // nếu như kiểu file hợp lệ
    return callback(null , true)
}


// khởi tạo FN upload của multer

const upload = multer({
    limits: {fileSize: LIMIT_COMMON_FILE_SIZE},
    fileFilter: customFileFilter
})

export const multerUploadMiddleware = {upload}