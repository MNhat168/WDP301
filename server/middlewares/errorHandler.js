import asyncHandler from 'express-async-handler'

export const notFound = asyncHandler(async (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error)
})

export const errHandler = asyncHandler(async (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode)
    res.json({
        status: false,
        code: statusCode,
        message: err.message,
        result: process.env.NODE_ENV === 'production' ? null : err.stack
    })
})