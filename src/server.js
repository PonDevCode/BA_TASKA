import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, GET_DB, CLOSE_DB } from '../src/config/mongoDB.js'
import { env } from './config/environment'
import { APIs_V1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
const START_SERVER = () => {
  const app = express()
  //Enable req.body json data
  app.use(express.json())
  // xử lý cors
  app.use(cors(corsOptions))
  
  app.use('/v1', APIs_V1)

  app.use(errorHandlingMiddleware);
  app.get('/', async (req, res) => {
    res.end('<h1>Pon Dev Code</h1>')
  })

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`3.Hi ${env.AUTHOR}, Back end is runing successfully at host: http://${env.APP_HOST}:${env.APP_PORT}/`)
  })
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
