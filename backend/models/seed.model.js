import mongoose from "mongoose";

const seedSchema = new mongoose.Schema(
  {
    subServiceName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      required: true,
    },
    isSeeded: {
      type: Boolean,
      default: false, 
    },
  },
  {
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

seedSchema.virtual("formattedCreatedAt").get(function () {
  return new Date(this.createdAt).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
});

seedSchema.virtual("formattedUpdatedAt").get(function () {
  return new Date(this.updatedAt).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
});

const SeedSubService = mongoose.model("SeedSubService", seedSchema);

export default SeedSubService;
