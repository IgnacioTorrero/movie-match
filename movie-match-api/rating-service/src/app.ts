import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import ratingRoutes from "./routes/rating.routes";
import { errorHandler } from "./middlewares/error.middleware";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const swaggerDocument = YAML.load(path.resolve(__dirname, "../swagger.yaml"));

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use("/api/ratings", ratingRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorHandler);

export default app;
