export default class AuthController {
  constructor({ authService }) {
    this.authService = authService;
    this.login = this.login.bind(this);
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login({ email, password });

      return res.status(200).json({
        data: {
          accessToken: result.accessToken,
          user: result.user
        }
      });
    } catch (error) {
      next(error);
    }



    
  }
}