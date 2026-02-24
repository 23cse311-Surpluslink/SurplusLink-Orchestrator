import mongoose from 'mongoose';

const verificationLogSchema = new mongoose.Schema(
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
        status: {
            type: String,
            enum: ['approved', 'rejected', 'pending'],
            default: 'pending',
        },
        remarks: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const VerificationLog = mongoose.model('VerificationLog', verificationLogSchema);
export default VerificationLog;
