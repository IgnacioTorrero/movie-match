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
import swaggerUi from "swagger-ui-express";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const swaggerDocument = YAML.load(path.resolve(__dirname, "../swagger.yaml"));

app.use(express.json());
app.use(cors({
    origin: "http://localhost:8082",
    credentials: true,
  }));  
app.use(helmet());
app.use(morgan("dev"));
app.use("/api/recommendations", recomendationRoutes);
app.use(errorHandler);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
