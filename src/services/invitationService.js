import { StatusCodes } from "http-status-codes"
import { boardModel } from "../models/boardModel"
import { userModel } from "../models/userModel"
import ApiError from "../utils/ApiError"
import { pickUser } from "../utils/pickUser"
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '../utils/constants.js'
import { invitationModel } from "../models/invitationModel"
const createNewBoardInvitation = async (reqBody, inviterId) => {
    try {
        // người đi mời : chính là người dang request , nên chúng ta tìm theo id cứ lấy từ token
        const inviter = await userModel.findOneById(inviterId)
        // người được mời : lấy từ FE gửi lên
        const invitee = await userModel.findOneByIdEmail(reqBody.inviteeEmail)
        // tìm luôn cái board để lấy data ra sử lý 
        const board = await boardModel.findOneById(reqBody.boardId)
        // nếu không tồn tại 1 trong 3 thì cứ thẳng tay reject
   
        if (!invitee || !inviter || !board) { throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter , invitee or board not fonud ') }
        if (invitee._id.toString() === inviter._id.toString() ) { throw new ApiError(StatusCodes.CONFLICT, 'User already exists in the board') }

        const listOwnerAndMember = [...board.ownerIds,...board.memberIds]
        const isCheck = listOwnerAndMember.some( i => i.toString() === invitee._id.toString())
        
        if (isCheck)  throw new ApiError(StatusCodes.CONFLICT, 'User already exists in the board')
        // tạo data cần thiết để lưu vào trong db
        // có thể thử bỏ hoặc làm sai lệch type , boardInvitation , status để xem Model validate oke chưa

        const newInvitationData = {
            inviterId,
            inviteeId: invitee._id.toString(), // chuyển từ objectId về string vì sang bên modal có cheack lại data ở hàm create
            type: INVITATION_TYPES.BOARD_INVITATION,
            boardInvitation: {
                boardId: board._id.toString(),
                status: BOARD_INVITATION_STATUS.PENDING
            }
        }

        // gọi sang modal để lưu vào db
        const createInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
        const getInvitation = await invitationModel.findOneById(createInvitation.insertedId)

        // ngoài những thông tin của cái board invitation mới tạo thì trả về đủ cả luôn board , inviter , invitee cho FE dễ mà sử lý
        const resInvitation = {
            ...getInvitation,
            board,
            invitee: pickUser(invitee),
            inviter: pickUser(inviter)
        }
        return resInvitation

    } catch (error) { throw error }
}

const getInvitations = async (id) => {
    try {
        const getInvitation = await invitationModel.findByUser(id)
        // vì dữ liệu invitee và inviter và board là đang ở giá trị mãng 1 phần tử nếu lấy ra được nên chúng ta biến đổi nó về Object trước khi trả cho FE
        const resInvitations = getInvitation.map(i => {
            return {
                ...i,
                inviter: i.inviter[0] || {},
                invitee: i.invitee[0] || {},
                board: i.board[0] || {},
            }
        })  
        console.log();
        
        return resInvitations
    } catch (error) { throw error }
}

const updateBoardInvitation = async (id, invitationId, status) => {
    try {
        // tìm bản ghi invitation trong model 
        const getInvitation = await invitationModel.findOneById(invitationId)
        if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'invitation not_found')

        // sau khi có invitation rồi thì lấy full thông tin board
        const boardId = getInvitation.boardInvitation.boardId
        const getBoard = await boardModel.findOneById(boardId)
        if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'board not_found')

        // kiểm tra xem nếu status là ACCEPTED join board mà cái thằng user (invitee) đã là owner hoặc menber của board rồi thì thông báo lỗi
        
        // cách 1
        // if (status === BOARD_INVITATION_STATUS.PENDING) {
        //     const checkOwner = getBoard?.ownerIds.some(ownerIds => ownerIds.toString() === id.toString())
        //     if (!checkOwner) throw new ApiError(StatusCodes.CONFLICT, 'User already exists in the board')
        //     const checkMember = getBoard?.memberIds.some(memberIds => memberIds.toString() === id.toString())
        //     if (!checkMember) throw new ApiError(StatusCodes.CONFLICT, 'User already exists in the board')
        // }

        // cách viết 2
        const listOwnerAndMember = [...getBoard.ownerIds,...getBoard.memberIds]
        const isCheck = listOwnerAndMember.some( i => i.toString() === id.toString())
        
        if (status === BOARD_INVITATION_STATUS.REJECTED && isCheck) {
            throw new ApiError(StatusCodes.CONFLICT, 'User already exists in the board')
        }

        // tạo dữ liệu update bản ghi Invitation
        const updateData = {
            boardInvitation: {
                ...getInvitation.boardInvitation,
                status : status
            }
        }
        // b1 cập nhật lại bản ghi status trong bản ghi Invitation
        const updatedInvitation = await invitationModel.update(invitationId,updateData)

        // b2 nếu trường hợp accepted một lời mời thành công , thì cần phải thêm thông tin thằng user (userId) vào bản ghi memberIds trong collection board
        // const updateedBoard = {
        //     ...getBoard,
        //     memberIds: id
        // }

        //  await boardModel.update(boardId,updateedBoard)

        if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED){
            await boardModel.pushMemberIds(boardId,id)
        }
        return updatedInvitation



        // note 2 thằng memberIds và ownerIds của board nó đang là kiểu dữ liệu ObjectId thì chuyển nó về string hết để kiểm tra một thể 




    } catch (error) { throw error }
}
export const invitationService = {
    createNewBoardInvitation,
    getInvitations,
    updateBoardInvitation
}