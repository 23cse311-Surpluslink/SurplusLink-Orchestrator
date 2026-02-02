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
    coordinates: {
      lat: Number,
      lng: Number,
    },
    // GeoJSON coordinates for geospatial queries (used for NGOs and volunteers)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    avatar: String,
    otp: String,
    otpExpires: Date,
    ngoProfile: {
      dailyCapacity: { type: Number, default: 0 },
      storageFacilities: [{ type: String, enum: ['cold', 'dry', 'frozen'] }],
      isUrgentNeed: { type: Boolean, default: false },
    },
    stats: {
      trustScore: { type: Number, default: 5.0 },
      totalRatings: { type: Number, default: 0 },
      completedDonations: { type: Number, default: 0 },
      cancelledDonations: { type: Number, default: 0 },
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    volunteerProfile: {
      tier: {
        type: String,
        enum: ['rookie', 'hero', 'champion'],
        default: 'rookie',
      },
      vehicleType: {
        type: String,
        enum: ['bicycle', 'scooter', 'car', 'van'],
      },
      maxWeight: {
        type: Number,
      },
      currentLocation: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [0, 0],
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ 'volunteerProfile.currentLocation': '2dsphere' });
userSchema.index({ 'location': '2dsphere' }); // Index for NGO geospatial queries

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
