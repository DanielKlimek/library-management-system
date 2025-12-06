import connectToDB from "./config/DB.js";

import { errorHandler } from "./middleware/errorHandler.js";

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoute from "./routes/auth.route.js";

dotenv.config();
connectToDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server running on port http://localhost:${PORT}`);
});
