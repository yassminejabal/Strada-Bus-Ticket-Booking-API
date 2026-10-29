import express from 'express'
import { container } from '../../../bootstrap/container.js'

class coachRouters{
    constructor(){
        this.route = express.Router()
        this.coachController = container.resolve('CoachController')
        this.initRouters()
    }


    initRouters () {
        this.route.get('/', this.coachController.get)
        this.route.get('/:id', this.coachController.getOne)
    }
    getRouter =  () =>{
        return this.route
    }
}




export default coachRouters

