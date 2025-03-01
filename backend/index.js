require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas!");
  } catch (err) {
    console.error("MongoDB Connection Failed:", err.message);
  }
};
connectDB();

// Define Schema & Model
const DestinationSchema = new mongoose.Schema({
  city: String,
  country: String,
  clues: [String],
  fun_fact: [String],
  trivia: [String],
});

const Destination = mongoose.model("Destination", DestinationSchema);

// API: Fetch One Random Destination + 3 Random Incorrect Options
app.get("/api/get-destination", async (req, res) => {
  try {
    const count = await Destination.countDocuments();
    const randomIndex = Math.floor(Math.random() * count);
    const correctDestination = await Destination.findOne().skip(randomIndex);

    // Fetch 3 incorrect options
    const incorrectOptions = await Destination.aggregate([
      { $match: { city: { $ne: correctDestination.city } } },
      { $sample: { size: 3 } }, // Randomly select 3
      { $project: { city: 1, _id: 0 } },
    ]);

    const options = [correctDestination.city, ...incorrectOptions.map((d) => d.city)]
      .sort(() => 0.5 - Math.random()); // Shuffle options

    res.json({ destination: correctDestination, options });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
