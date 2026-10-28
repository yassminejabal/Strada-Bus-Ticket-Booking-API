import CoatchModel from '../models/coach.model.js'


export default class CoatchController{
    get = (req, res)=>{
        console.log('coachController')
        return res.status(200).json({
            message: "resutn all the coachs in application"
        })
    }

    getOne = (req, res)=>{
        const params = req.params
        return res.status(200).josn({
            message: "get one coach with",
            data: params
        })
    }


} 