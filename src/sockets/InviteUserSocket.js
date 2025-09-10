export const InviteUserSocket = (io,socket) => {

    // socket.on lắng nghe sự kiện mà FE emit lên BE
    socket.on('FE_USER_INVITED_BOARD', (invitation) => {
        // cách làm nhanh và đơn giản nhất : emit ngược lại một sự kiện về cho client khác ngoại trừ chính cái thằng gửi request lên rồi để phía FE check
        socket.broadcast.emit('BE_USER_INVITED_BOARD', invitation)

    })
    // bắt sự kiện là user không còn online k
    socket.on('disconnect', (reason) => {
        console.log(`❌ User disconnected: ${socket.id}, reason: ${reason}`);
    });

}