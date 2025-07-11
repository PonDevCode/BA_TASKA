<!-- Học code cùng Pon -->

<!--

                        Cấu trúc code

Browser  <==>   Server <==> router <==> 1.Middlewares <===> Controller <==> service <==> Models <==> DTB
API call           ||                     2.Validation
                   ||

            Socket.io For real time
                (web socket)

 -->

 <!-- 
 Công nghệ sử dụng

 1.Cấu hình sử lý lỗi tập trung (ở middlewares)
 https://expressjs.com/en/guide/error-handling.html
 
        app.use((err, req, res, next) => {
        console.error(err.stack)
        res.status(500).send('Something broke!')
        })
  -->
