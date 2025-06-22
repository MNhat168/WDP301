import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"
import initRoutes from './routes/index.js'

const app = express()
const port = process.env.PORT || 5000

//Config
dotenv.config()

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Cho phép requests không có origin (mobile apps, etc.)
        if (!origin) return callback(null, true);

        // Cho phép tất cả origins trong development
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }

        // Danh sách các origins được phép
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            process.env.FRONTEND_URL
        ];

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Trong development, cho phép tất cả
            callback(null, true);
        }
    },
    credentials: true, // Cho phép cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
initRoutes(app)


console.log('Cloudinary Config:', {
    name: process.env.CLOUDINARY_NAME,
    key: process.env.CLOUDINARY_KEY ? '***' : 'MISSING',
    secret: process.env.CLOUDINARY_SECRET ? '***' : 'MISSING'
});
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err))

app.listen(port, () => {
    console.log('Server is running on port ' + port)
})