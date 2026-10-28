import express from 'express'
import { container } from '../../../bootstrap/container.js'

class coachRouters{
    constructor(){
        this.route = express.Router()
        this.coachController = container.resolve('CoachController')
        console.log("Before initializeRoutes");
        this.initRouters()
        console.log("After initializeRoutes");
    }


    initRouters () {
        console.log("2. initializeRoutes called");
        this.route.get('/', ()=>{
            console.log("name")
            res.status(200).json({
                message: "testing the router"
            })
        })
        this.route.get('/:id', this.getOneCoach)
    }
    getAllCoachs(req, res){
        console.log('test')
        this.coachController.get(req,res)
    }

    getOneCoach(req, res){
        this.coachController.getOne(req, res)
    }
    getRouter =  () =>{
        console.log('getRouter')
        return this.route
    }
}




export default coachRouters

