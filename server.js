const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const sessionRoutes = require("./routes/sessions");

const app = express();

app.use(
  cors({
    origin: "https://arvyax-demo.vercel.app", //frontend domain
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", sessionRoutes);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
