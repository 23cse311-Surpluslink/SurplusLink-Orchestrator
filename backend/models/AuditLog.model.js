import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ['user', 'donation', 'safety', 'verification', 'system'],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
        },
        ipAddress: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
