import express from 'express'
import cors from 'cors'
import healthRoute from './routes/healthcheck.routes.js';
import authRoutes from './routes/auth.routes.js';
import errorHandler from './middlewares/error.middleware.js';
// import userRoutes from './routes/user.routes.js';
import accountRoutes from './routes/account.routes.js';
import sessionRoutes from './routes/session.routes.js';
import passport from './config/passport.js'

const app = express();
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static("public"))

app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || "http://localhost:5173",
    credentials: true,
    methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders: ["Authorization","Content-Type"]
}))

app.use(passport.initialize());


app.use("/api/v1/healthcheck",healthRoute)
app.use('/api/v1/auth', authRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/sessions', sessionRoutes);


app.use(errorHandler)
export default app;