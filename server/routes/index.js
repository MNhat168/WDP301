import userRoutes from './userRoutes.js'
import jobRoutes from './jobRoutes.js'
import employerJobRoutes from './employerJobRoutes.js'
import companyRoutes from './companyRoutes.js'
import cvRoutes from './cvRoutes.js'
import messageRoutes from './messageRoutes.js'
import categoryRoutes from './categoryRoutes.js'
import subscriptionRoutes from './subscriptionRoutes.js'
import paymentRoutes from './paymentRoutes.js'
import applicationRoutes from './applicationRoutes.js';
import usageRoutes from './usageRoutes.js';
import adminRoutes from './adminRoutes.js';
import aiMatchingRoutes from './aiMatchingRoutes.js';
import { notFound, errHandler } from '../middlewares/errorHandler.js'

const initRoutes = (app) => {
    //user Router
    app.use('/api/user', userRoutes)
    app.use('/api/jobs', jobRoutes)
    app.use('/api/employer/jobs', employerJobRoutes)
    app.use('/api/applications', applicationRoutes)
    app.use('/api/companies', companyRoutes)
    app.use('/api/cv', cvRoutes)
    app.use('/api/messages', messageRoutes)
    app.use('/api/categories', categoryRoutes)
    app.use('/api/subscriptions', subscriptionRoutes)
    app.use('/api/payments', paymentRoutes)
    app.use('/api/usage', usageRoutes)
    app.use('/api/admin', adminRoutes)
    app.use('/api/ai-matching', aiMatchingRoutes)
    app.use(notFound)
    app.use(errHandler)
}

export default initRoutes