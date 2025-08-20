import express, { Express, json } from "express";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import { PrismaClient } from "@prisma/client";
import authRouter from "./routes/auth.route";
import adminRouter from "./routes/admin.route";
import cartRouter from "./routes/cart.route";
import categoryRouter from "./routes/category.route";
import orderRoutes from "./routes/order.route";
import swaggerUi from "swagger-ui-express";

import YAML from "yaml";
import fs from "fs";
import path from "path";
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from "cookie-parser";

const app: Express = express();
const PORT = process.env.PORT || 8080;
export const prisma = new PrismaClient();

// Load Swagger documentation
const swaggerFile = fs.readFileSync(
  path.join(__dirname, "docs/swagger.yaml"),
  "utf8"
);
const swaggerDocument = YAML.parse(swaggerFile);

async function main() {
  // Middleware
  app.use(
    cors({
      origin: "https://vshop-beta.vercel.app/", // frontend URL, NOT "*"
      credentials: true, // allow cookies
    })
  );
  app.use(cookieParser());

  app.use(json());

  // Swagger UI
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  //Routes
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/user", authRouter);
  app.use("/api/v1/category", categoryRouter);
  
  //Add this
  app.use("/api/v1/user",cartRouter);
  app.use("/api/v1",orderRoutes);

  app.listen(PORT, () => {
    console.log(`⚙️ Server is running at port: ${PORT}`);
    console.log(
      `📚 API Documentation available at: http://localhost:${PORT}/api-docs`
    );
  });
}

main()
  .then(async () => {
    await prisma.$connect();
  })
  .catch(async (e) => {
    await prisma.$disconnect();
    process.exit(1);
  });
