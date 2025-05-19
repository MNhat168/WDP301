const userRouter = require("./userRoutes")
const { notFound, errHandler } = require('../middlewares/errorHandler')

const initRoutes = (app) => {
    //user Router
    app.use('/api/user', userRouter)
    app.use(notFound)
    app.use(errHandler)
}

module.exports = initRoutes