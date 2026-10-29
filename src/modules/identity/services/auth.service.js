import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default class AuthService {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async login({ email, password }) {
    // 1. التحقق من وجود المستخدم عبر الإيميل
    const user = await this.userRepository.findByEmail(email);
    
    // Critère: Si les identifiants sont incorrects, une erreur adaptée est retournée (401)
    const genericError = new Error('Identifiants incorrects');
    genericError.statusCode = 401;
    genericError.code = 'INVALID_CREDENTIALS';

    if (!user) {
      throw genericError;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw genericError;
    }

    const tokenPayload = {
      userId: user._id,
      role: user.role,
      fullName: user.fullName
    };

    const accessToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    return {
      accessToken,
      user
    };
  }
}