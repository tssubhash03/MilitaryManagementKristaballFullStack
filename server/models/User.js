import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true }, // ✅ added
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "commander", "logistics"],
    required: true
  },
  base: {
    type: Number,
    enum: [1, 2, 3, 4],
    required: function() {
      return this.role !== "admin";
    }
  }
});


export default mongoose.model("User", userSchema);
