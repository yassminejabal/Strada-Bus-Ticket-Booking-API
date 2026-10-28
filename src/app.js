import express from 'express'
import {setup} from './bootstrap/container.js'
const  app = express()
setup()
import {coachRouters} from './modules/catalogue/index.js'
const CoachRouter = 
app.use("/coache", (new coachRouters()).getRouter)



app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/', (req, res)=>{
    res.status(200).json({
        message: 'hello world'
    })
})

export  default app

