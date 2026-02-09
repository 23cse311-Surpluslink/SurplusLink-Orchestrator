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
      mealsSaved: { type: Number, default: 0 },
      co2Saved: { type: Number, default: 0 },
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    currentTaskCount: {
      type: Number,
      default: 0,
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
      lastLocationUpdate: {
        type: Date,
        default: Date.now
      },
      lastMissionDate: {
        type: Date
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ 'volunteerProfile.currentLocation': '2dsphere' });
userSchema.index({ 'location': '2dsphere' });

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  // 1. Password Hashing
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // 2. Geospatial Synchronization & Data Sanitization
  // Ensure GeoJSON 'location' field stays in sync with 'coordinates' {lat, lng}
  // Also sanitize 'coordinates' to ensure it's not a legacy array
  if (Array.isArray(this.coordinates)) {
    const coordsArray = this.coordinates;
    this.coordinates = {
      lng: coordsArray[0] || 0,
      lat: coordsArray[1] || 0
    };
  }

  if (this.coordinates && this.coordinates.lat !== undefined && this.coordinates.lng !== undefined) {
    // Force numbers to prevent casting issues
    const lat = Number(this.coordinates.lat);
    const lng = Number(this.coordinates.lng);

    // Sync Root GeoJSON
    this.location = {
      type: 'Point',
      coordinates: [lng, lat] 
    };

    // Sync Volunteer Profile GeoJSON
    if (this.role === 'volunteer') {
      if (!this.volunteerProfile) this.volunteerProfile = {};
      this.volunteerProfile.currentLocation = {
        type: 'Point',
        coordinates: [lng, lat]
      };
      this.volunteerProfile.lastLocationUpdate = new Date();
    }
  }

  next();
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
