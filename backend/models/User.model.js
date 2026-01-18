import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['donor', 'ngo', 'volunteer', 'admin'],
      required: true,
    },
    organization: {
      type: String,
      required: function () {
        return this.role === 'ngo' || this.role === 'donor';
      },
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'deactivated', 'rejected'],
      default: 'pending',
    },
    taxId: String,
    permitNumber: String,
    documentUrl: String,
    address: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
  },
});

const User = mongoose.model('User', userSchema);

export default User;
