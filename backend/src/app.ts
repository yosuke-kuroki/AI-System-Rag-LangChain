import express from "express";
import { json } from "body-parser";
import dotenv from "dotenv";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

// Load environment variables
dotenv.config();

// Database connection and seeding
import { connectDB } from "./db";
import { seedData } from "./seed";

// Route imports
import authRoutes from "./routes/auth";
import pingRoutes from "./routes/ping";
import documentsRoutes from "./routes/documents";
import teamRoutes from "./routes/team";
import investmentsRoutes from "./routes/investments";
import sectorsRoutes from "./routes/sectors";
import consultationsRoutes from "./routes/consultations";
import scrapeRoutes from "./routes/scrape";

// Auth middleware (applied to all routes except /auth/token)
import { bearerAuth } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 3456;

app.use(json());

/**
 * Swagger configuration:
 * This configuration includes comprehensive metadata, tags, and custom options.
 */
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RAG & LangChain System Backend API",
      version: "1.0.0",
      description: "API Documentation for the RAG System Backend API",
      contact: {
        name: "Son Nguyen",
        url: "https://sonnguyenhoang.com",
        email: "hoangson091104@gmail.com",
      },
      license: {
        name: "MIT License",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: "Auth", description: "Authentication related endpoints" },
      { name: "Ping", description: "Ping endpoint to check API connectivity" },
      { name: "Documents", description: "Document download endpoints" },
      { name: "Team", description: "Team member endpoints" },
      { name: "Investments", description: "Investment endpoints" },
      { name: "Sectors", description: "Sector endpoints" },
      { name: "Consultations", description: "Consultation endpoints" },
      { name: "Scrape", description: "Web scraping endpoints" },
    ],
  },
  // Point to the API docs in your route files (make sure your route files contain proper JSDoc annotations)
  apis: ["./src/routes/*.ts"],
};

const specs = swaggerJsdoc(options);

// Swagger UI options – this sets the browser tab title.
const swaggerUiOptions = {
  customSiteTitle: "RAG System Backend API Docs",
};

// Mount Swagger UI on the "/docs" route.
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// Redirect the root ("/") to "/docs"
app.get("/", (req, res) => {
  res.redirect("/docs");
});

// Unprotected route for token retrieval
app.use("/auth", authRoutes);

// Protect all routes below with Bearer auth middleware.
app.use(bearerAuth);

// API endpoints:
app.use("/ping", pingRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/investments", investmentsRoutes);
app.use("/api/sectors", sectorsRoutes);
app.use("/api/consultations", consultationsRoutes);
app.use("/api/scrape", scrapeRoutes);

// Connect to MongoDB and seed data, then start the server.
connectDB().then(() => {
  seedData().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
    });
  });
});
