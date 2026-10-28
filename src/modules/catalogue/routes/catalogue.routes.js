import CoachController from '../controllers/coach.controller.js'
import express from 'express'
const router =  express.Router()

export default  class CoachRouter{
    getAllCoach = ()=>{
        return router.get('/', CoachController.get)
    }

    getOneCoach = ()=> {
        return router.get('/:id', CoachController.getOne)
    }
}