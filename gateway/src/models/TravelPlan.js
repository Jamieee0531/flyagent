'use strict';

const { Schema, model, Types } = require('mongoose');

const travelPlanSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    selectedFlight: { type: Schema.Types.Mixed },
    selectedHotel:  { type: Schema.Types.Mixed },
    itinerary:      { type: Schema.Types.Mixed, default: [] },
    tips:           { type: Schema.Types.Mixed },
    mbtiType:       { type: String },
    quickPick:      { type: Schema.Types.Mixed },
  },
  { timestamps: true, strict: false, minimize: false }
);

travelPlanSchema.index({ userId: 1, createdAt: -1 });

module.exports = model('TravelPlan', travelPlanSchema);
