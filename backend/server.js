const express = require("express");
const PORT = 8000;
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("views"));

const DB_URL =
  "mongodb+srv://izhanhumayun:izhan2005@cluster0.2ecbdrc.mongodb.net/test";
mongoose.connect(DB_URL);
const conn = mongoose.connection;

conn.once("open", () => {
  console.log("database connected successfully");
});

//Models
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const user = mongoose.model("user", userSchema);

//routes
app.get("/", (req, res) => {
  res.send("Hello from Backend Server....");
});

app.get("/users", async (req, res) => {
  try {
    res.status(200).sendFile(path.join(__dirname, "Views", "users.html"));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await user.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.post("/users/delete", async (req, res) => {
  try {
    const { id } = req.body;
    const deleteUser = await user.deleteOne({ _id: id });
    if (deleteUser.deletedCount === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      msg: "User deleted successfully",
      deletedCount: deleteUser.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    console.log(req.body);

    const userExists = await user.findOne({ email });
    if (userExists) return res.status(400).json({ msg: "User already exists" });

    const newUser = await user.create({ firstName, lastName, email, password });

    res.json({ msg: "User registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const User = await user.findOne({ email });

    if (!User) return res.status(400).json({ msg: "User not found" });

    if (User.password !== password)
      return res.status(400).json({ msg: "Invalid password" });

    const username = `${User.firstName} ${User.lastName}`;

    res.json({ msg: "Login successful", username });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}....`);
});
