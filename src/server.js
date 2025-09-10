import express from 'express'

import exitHook from 'async-exit-hook'
import { CONNECT_DB, GET_DB, CLOSE_DB } from '../src/config/mongoDB.js'
import { env } from './config/environment.js'
import { APIs_V1 } from './routes/v1/index.js'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware.js'
import cors from 'cors'
import { corsOptions } from './config/cors.js'


// Cấu Hình Socket.io server
import http from 'http'
// import socketIo from 'socket.io'

import cookieParser from 'cookie-parser'
// import { InviteUserSocket } from './sockets/InviteUserSocket.js'
import { socketCustom } from './sockets/index.js'

const START_SERVER = () => {
  const app = express()

  // Fix cái vụ Cache from disk của expressJS
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
  // cấu hình cookieParser
  app.use(cookieParser())
  //Enable req.body json data
  app.use(express.json())
  // xử lý cors
  app.use(cors(corsOptions))

  app.use('/v1', APIs_V1)
  // cấu hình hiện lỗi tập chung
  app.use(errorHandlingMiddleware);



  // Tạo một server mới bọc thằng app express để làm real-time với soket.io
  const server = http.createServer(app)
  // khởi tạo biến io với server và cors
  // const io = socketIo(server, { cors: corsOptions })
  // io.on('connection', (socket) => {
  //   InviteUserSocket(socket)
  // });

  socketCustom(server)



  app.get('/', async (req, res) => {
    res.end('<h1>Pon Dev Code</h1>')
  })

  // môi trường production  
  if (env.BUILD_MODE === 'production') {
    // dùng server.listen thây vì app.listen vì lúc này đã bao gôm express app và đã config socket.io
    server.listen(env.PORT,'0.0.0.0', () => {
      console.log(`3.Production : hi ${env.AUTHOR}, Back end is runing successfully at Port : http://0.0.0.0:${env.PORT}`)
    })
  } else {

    // đây là môi trường local dev
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`3.Local Dev : Hi ${env.AUTHOR}, Back end is runing successfully at host: http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/`)
    })
  }

  exitHook(() => {
    console.log('4. Disconnecting form MongoDB Cloud Atlas');
    CLOSE_DB();
    console.log('4. Disconnecting form MongoDB Cloud Atlas');
  });

}



(async () => {
  try {
    console.log('1. Connecting To MongoDB Cloud Atlas....');
    await CONNECT_DB()
    console.log('2. Conneted to mongoBD cloud Atlas! / Bạn đã chạy và kết  nối server thành công')
    START_SERVER()
  } catch (error) {
    console.log(error);
    process.exit(0)

  }
})()
// console.log('1. Connecting To MongoDB Cloud Atlas....');

// CONNECT_DB()
//   .then(() => console.log('2. Conneted to mongoBD cloud Atlas! / Bạn đã chạy và kết  nối server thành công'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.error(error);
//     process.exit(1)

//   })
