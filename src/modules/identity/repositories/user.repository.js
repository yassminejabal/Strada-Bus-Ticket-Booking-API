export default class UserRepository {
  constructor({ UserModel    }) {
    this.UserModel = UserModel;
  }

  async findByEmail(email) {
    return await this.UserModel.findOne({ email });
  }

  async create(userData) {
    const user = new this.UserModel(userData);
    return await user.save();
  }
}