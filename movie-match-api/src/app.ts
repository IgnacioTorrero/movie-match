import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import movieRoutes from "./routes/movie.routes";
import authRoutes from "./routes/auth.routes";
import ratingRoutes from "./routes/rating.routes";
import recomendationRoutes from "./routes/recomendation.routes";
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use("/api", movieRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/recommendations", recomendationRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
