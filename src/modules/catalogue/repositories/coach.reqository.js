export default class coachRepository{
        constructor({CoachModel}){
            this.CoachModel = CoachModel
        }
        async getAll(){
            try {
                const coaches = await  this.CoachModel.find()
                console.log("test", coaches)    

                if(!coaches) {
                    return [
                        {message: "no coach found!"}
                    ]
                }
                return [{
                    name: "younes rajix",       
                    // data: coaches
                }
                ]
            } catch (error) {
                console.log(error)
                throw new Error("error in repository coach")
            }
        }
}