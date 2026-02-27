import mongoose from 'mongoose';

/**
 * @model ImpactMetric
 * @description Stores aggregated system-wide impact data (Daily) for administrative reporting.
 *              Enables tracking "Impact Over Time" as required by User Story 7.1.
 */
const impactMetricSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
            unique: true, // One aggregate record per day
        },
        totalMeals: {
            type: Number,
            default: 0,
        },
        totalCo2: {
            type: Number,
            default: 0,
        },
        donationsCompleted: {
            type: Number,
            default: 0,
        },
        totalWeightKg: {
            type: Number,
            default: 0,
        },
        // Storage for unique participants to enable count aggregation
        donors: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        ngos: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    {
        timestamps: true,
    }
);

// Indexes for date range reports
impactMetricSchema.index({ date: 1 });

const ImpactMetric = mongoose.model('ImpactMetric', impactMetricSchema);

export default ImpactMetric;
