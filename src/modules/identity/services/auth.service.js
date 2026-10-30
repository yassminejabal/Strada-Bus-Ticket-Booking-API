import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default class AuthService {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async login({ email, password }) {
    const user = await this.userRepository.findByEmail(email);
    
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

  async register(userData) {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      const error = new Error('Cet email est déjà utilisé.');
      error.statusCode = 400;
      throw error;
    }

    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    const newUser = await this.userRepository.create(userData);

    return newUser;
  }
}