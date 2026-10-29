

export default class CoatchController{
    
    constructor({CoachService}){
        this.CoachService = CoachService
    }
    get = async(req, res)=>{
        const coaches = await this.CoachService.getCoach()
        return res.status(200).json({
            message: "resutn all the coachs in application",
            coaches: coaches
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