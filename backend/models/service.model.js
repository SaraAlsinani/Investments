import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Marketing", "Financial", "IT"],
  },
  update_at: {
    type: Date,
    default: Date.now, 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { 
  timestamps: true, 
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true }
});


serviceSchema.pre('save', function (next) {
  this.update_at = new Date(); 
  next();
});

serviceSchema.virtual('formattedCreatedAt').get(function () {
  return new Date(this.createdAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
});

serviceSchema.virtual('formattedUpdatedAt').get(function () {
  return new Date(this.updatedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
});

const Service = mongoose.model("Service", serviceSchema);

export default Service;
