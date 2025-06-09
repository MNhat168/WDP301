import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()
mongoose.set('strictQuery', false)
const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            family: 4,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
        if(conn.connection.readyState === 1) console.log("DB Connect successfully!")
        else console.log("Connection failed")
    } catch (error) {
        console.log("DB Connection is failed")
        console.log("Error details:", error.message)
        throw new Error(error) 
    }
}

export default dbConnect