import { Router, Request, Response } from "express";
import { sectors } from "../data/data";

const router = Router();

/**
 * GET /api/sectors
 * Returns details for a specific sector.
 * Query parameter: sector (required)
 */
router.get("/", (req: Request, res: Response) => {
  const sectorQuery = req.query.sector as string;
  if (!sectorQuery) {
    return res.status(400).json({ error: "Query parameter 'sector' is required" });
  }
  const sectorData = sectors.find(
    (s) => s.sector.toLowerCase() === sectorQuery.toLowerCase()
  );
  if (!sectorData) {
    return res.status(404).json({ error: "Sector not found" });
  }
  res.json(sectorData);
});

export default router;
