const express = require('express')
require('dotenv').config()
const dbConnect = require("./config/dbconnect")
const initRoutes = require("./routes/index")
const cookieParser = require("cookie-parser")

const app = express()
const port = process.env.PORT || 8080
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
dbConnect()
initRoutes(app)

app.listen(port, () => {
    console.log('Server run on port ' + port)
})