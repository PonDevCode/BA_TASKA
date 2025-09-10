import { env } from '../config/environment.js'
import cloudinary from 'cloudinary'
import streamifier from 'streamifier'

// bước cấu hình cloudinary , sử dụng v2 - version 2
const cloudinaryV2 = cloudinary.v2
cloudinaryV2.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_CLOUD_KEY,
    api_secret: env.CLOUDINARY_CLOUD_SECRET
})

// khởi tạo 1 function để thực hiện uplaod file lên CLoundin    ary
const streamUpload = (fileBuffer, folderName) => {
    return new Promise((resolve, reject) => {
        // tạo 1 cái luồn stream upload lên cloudinary
        const stream = cloudinaryV2.uploader.upload_stream({ folder: folderName }, (error, result) => {
            if (error) reject(error)
            else resolve(result);
        })

        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
}

export const CloudinaryProvider = { streamUpload }



