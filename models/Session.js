const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  tags: [
    {
      type: String,
    },
  ],
  json_file_url: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

sessionSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

// Index for better query performance
sessionSchema.index({ user_id: 1, status: 1 });
sessionSchema.index({ status: 1 });

module.exports = mongoose.model("Session", sessionSchema);
