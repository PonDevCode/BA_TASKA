import JWT from "jsonwebtoken";
/*
    Function tạo mới một token - cần 3 tham số đầu vào
    UserInfo : những thông tin muốn đính kèm vào token
    secretSignature: chữ ký bí mật ( dạng một chuỗi string ngẫu nhiên ) trên docs thì để tên la privateKey tùy đều được
    tokenLife : thời gian sống của token 
*/
const generateToken = async (UserInfo,secretSignature,tokenLife) => {
    try {
        // hàm sign của thư viện JWT - thuật toán mặt định là HS256 
        return JWT.sign(UserInfo,secretSignature,{algorithm:'HS256', expiresIn:tokenLife})
    } catch (error) {throw new Error(error)}
}

/*
    Function kiểm tra token có hợp lệ hay không
*/
const verifyToken = async (token,secretSignature) => {
    try {
        // hàm verify của thư viện jwt
        return JWT.verify(token,secretSignature)
    } catch (error) {throw new Error(error)}
}

export const JwtProvider = {
    generateToken,
    verifyToken 
}