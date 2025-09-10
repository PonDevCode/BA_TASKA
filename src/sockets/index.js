    // Cấu Hình Socket.io server

    import socketIo from 'socket.io'
    import { corsOptions } from '../config/cors';
    import { InviteUserSocket } from './InviteUserSocket';

    export const socketCustom = (server) => {
        const io = socketIo(server, { cors: corsOptions })
        io.on('connection', (socket) => {
            InviteUserSocket(io,socket)
        });
    }   