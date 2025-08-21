import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("MongoDB connected ✅"))
.catch(err => console.log(err));

// Simple route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Example Model
const SoldierSchema = new mongoose.Schema({
  name: String,
  rank: String,
  unit: String,
});
const Soldier = mongoose.model("Soldier", SoldierSchema);

// POST soldier
app.post("/soldiers", async (req, res) => {
  const newSoldier = new Soldier(req.body);
  await newSoldier.save();
  res.json(newSoldier);
});

// GET soldiers
app.get("/soldiers", async (req, res) => {
  const soldiers = await Soldier.find();
  res.json(soldiers);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
