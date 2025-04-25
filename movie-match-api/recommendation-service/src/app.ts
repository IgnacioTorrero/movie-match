// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import recomendationRoutes from "./routes/recommendation.routes";
import { errorHandler } from "./middlewares/error.middleware";
import YAML from "yamljs";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/recommendations", recomendationRoutes);
app.use(errorHandler);

export default app;
