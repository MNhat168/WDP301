require('dotenv').config()
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const dbConnect = async () => {

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI,{
            family: 4,
        })
        if(conn.connection.readyState === 1) console.log("DB Connect successfully!")
        else console.log("Connection failed")

    } catch (error) {
        console.log("DB Connection is failed")
        throw new Error(error) 
    }

}

module.exports = dbConnect