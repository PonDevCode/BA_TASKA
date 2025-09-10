import { Resend } from 'resend'

const RESEND_API_KEY = 're_8LGjfYWx_N9qSR8j2SEL7Xb9MtRMuJTAZ' || process.env.RESEND_API_KEY


// Để gửi email , bạn phải chứng minh được rằng bạn sở hữu và có quyền kiểm soát tên miên domain mà bạn dang dùng để gửi 
// nếu không có domain thì bắt buộc phải dùng tạm email dev này của resend để test gửi mail
const ADMIN_SENDER_EMAIL = 'Pon DevCode <noreply@pondevcode.online>'

// tạo 1 cái instance của resend để sử dụng

const resendInstance = new Resend(RESEND_API_KEY)

//function gửi mail 
const sendEmail = async ({ to, subject, html }) => {
    try {
        const data = await resendInstance.emails.send({
            from: ADMIN_SENDER_EMAIL,
            to, // nếu chưa valid domain thì chỉ được gửi đến email mà bạn đăng kí tài khoản với resend
            subject,
            html
        })
        return data
    } catch (error) { throw error }
}
export const ResendProvider = {
    sendEmail
}