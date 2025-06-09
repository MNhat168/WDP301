import userRoutes from './userRoutes.js'
import jobRoutes from './jobRoutes.js'
import companyRoutes from './companyRoutes.js'
import cvRoutes from './cvRoutes.js'
import messageRoutes from './messageRoutes.js'
import { notFound, errHandler } from '../middlewares/errorHandler.js'

const initRoutes = (app) => {
    //user Router
    app.use('/api/user', userRoutes)
    app.use('/api/jobs', jobRoutes)
    app.use('/api/companies', companyRoutes)
    app.use('/api/cvs', cvRoutes)
    app.use('/api/messages', messageRoutes)
    app.use(notFound)
    app.use(errHandler)
}

export default initRoutes