export default class coachService{
    constructor({CoachRepository}){
        this.CoachRepository = CoachRepository
    }

    getCoach = async ()=>{
        try{
            const coaches = await this.CoachRepository.getAll()
            return coaches
        }catch(error){
            console.log(error)
            throw new Error("can get coaches")
        }

    }

    saveCoach(){

    }
    editCoach(){

    }

    deleteCoach(){

    }

}