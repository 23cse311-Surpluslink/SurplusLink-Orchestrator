import mongoose from 'mongoose';

const safetyRuleSchema = new mongoose.Schema(
    {
        foodType: {
            type: String,
            required: true,
            unique: true,
        },
        maxDurationHours: {
            type: Number,
            required: true,
        },
        storageRequired: {
            type: String,
            enum: ['cold', 'dry', 'frozen', 'none'],
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const SafetyRule = mongoose.model('SafetyRule', safetyRuleSchema);
export default SafetyRule;
