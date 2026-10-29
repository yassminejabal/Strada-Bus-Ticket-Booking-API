import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'passenger', 'agent'], 
    required: true,
    default: 'passenger'
  }
}, { timestamps: true });

userSchema.pre('save', async function () {
  const user = this;
  
  if (!user.isModified('password')) return;
  
  try {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
  } catch (error) {
    throw error;
  }
});

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const UserModel = mongoose.model('User', userSchema);
export default UserModel;