import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        foodType: {
            type: String,
            required: true,
        },
        quantity: {
            type: String,
            required: true,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        perishability: {
            type: String,
            enum: ['high', 'medium', 'low'],
            required: true,
        },
        photos: [
            {
                type: String,
            },
        ],
        pickupWindow: {
            start: {
                type: Date,
                required: true,
            },
            end: {
                type: Date,
                required: true,
            },
        },
        pickupAddress: {
            type: String,
            required: true,
        },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        allergens: [
            {
                type: String,
            },
        ],
        dietaryTags: [
            {
                type: String,
            },
        ],
        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'assigned', 'picked_up', 'completed', 'cancelled', 'expired', 'rejected'],
            default: 'active',
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'failed'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

donationSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    },
});

// Index for GeoJSON queries
donationSchema.index({ coordinates: '2dsphere' });

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;
