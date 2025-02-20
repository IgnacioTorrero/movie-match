import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import movieRoutes from "./routes/movie.routes";
import authRoutes from "./routes/auth.routes";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use("/api", movieRoutes);
app.use("/api/auth", authRoutes);

export default app;
