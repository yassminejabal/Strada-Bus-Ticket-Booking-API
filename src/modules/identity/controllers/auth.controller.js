export default class AuthController {
  constructor({ AuthService }) {
    this.AuthService = AuthService;
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await this.AuthService.login({ email, password });

      return res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
        console.log("👉 Register hit with body:", req.body); // زيدي هاد السطر هنا
      const userData = req.body;
      
      const newUser = await this.AuthService.register(userData);

      return res.status(201).json({
        success: true,
        message: "Compte créé avec succès",
        data: {
          user: newUser
        }
      });
    } catch (error) {
      next(error);
    }
  }
}