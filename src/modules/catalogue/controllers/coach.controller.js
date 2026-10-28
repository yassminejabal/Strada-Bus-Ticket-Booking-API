import CoatchModel from '../models/coach.model.js'


export default class CoatchController{
    get = (req, res)=>{
        return res.status(200).json({
            message: "resutn all the coachs in application"
        })
    }

    getOne = (req, res)=>{
        const params = req.params
        return res.status(200).json({
            message: "get one coach with",
            data: params
        })
    }


} 