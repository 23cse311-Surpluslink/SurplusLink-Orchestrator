import mongoose from 'mongoose';

const violationLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        violationType: {
            type: String,
            required: true,
        },
        actionTaken: {
            type: String,
            enum: ['warning', 'suspension', 'deactivation'],
            required: true,
        },
        description: {
            type: String,
        },
        severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'low',
        },
    },
    {
        timestamps: true,
    }
);

const ViolationLog = mongoose.model('ViolationLog', violationLogSchema);
export default ViolationLog;
