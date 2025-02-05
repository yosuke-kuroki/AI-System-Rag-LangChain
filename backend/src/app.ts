import express from "express";
import { json } from "body-parser";
import path from "path";

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
const PORT = process.env.PORT || 3000;

app.use(json());

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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
