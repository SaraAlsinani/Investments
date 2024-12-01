import mongoose from "mongoose";

const subServiceSchema = new mongoose.Schema({
  subServiceName: {
    type: String,
    required: true,
    trim: true 
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 1 
  },
  category: { 
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Under Processing", "Completed", "Pending"], 
    default: "Under Processing",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false, // حالة الدفع الافتراضية
  },
  paymentMethod: {
    type: String,
    enum: ["Credit Card", "PayPal", "Bank Transfer", "Cash"], // طرق الدفع
    default: null,
  },
  paymentDate: {
    type: Date,
    default: null, // تاريخ الدفع إذا تم
  },
}, { 
  timestamps: true, 
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

// يسهل القراءة
subServiceSchema.virtual('formattedCreatedAt').get(function () {
  return new Date(this.createdAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
});

subServiceSchema.virtual('formattedUpdatedAt').get(function () {
  return new Date(this.updatedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
});

const SubService = mongoose.model("SubService", subServiceSchema);

export default SubService;
