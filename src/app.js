import express from 'express'
import {setup} from './bootstrap/container.js'
import {coachRouters} from './modules/catalogue/index.js'
import {AuthRoutes } from './modules/identity/index.js'
import errorHandler from './middlewares/error.middleware.js';
const  app = express()
setup()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/auth', new AuthRoutes().getRouter())

app.use("/coache", (new coachRouters()).getRouter())
app.get('/', (req, res)=>{
    res.status(200).json({
        message: 'hello world'
    })
})

app.use(errorHandler);
export  default app

