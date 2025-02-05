import { Router, Request, Response } from "express";
import { consultations } from "../data/data";

const router = Router();

/**
 * GET /api/consultations
 * Returns consultation details for a specific consultant.
 * Query parameter: name (required)
 */
router.get("/", (req: Request, res: Response) => {
  const nameQuery = req.query.name as string;
  if (!nameQuery) {
    return res.status(400).json({ error: "Query parameter 'name' is required" });
  }
  // For simplicity, we filter consultations where the consultant’s name is mentioned in the details.
  // In a real scenario, the consultation data would include a consultant name field.
  const filtered = consultations.filter(c =>
    c.consultation_details.toLowerCase().includes(nameQuery.toLowerCase())
  );
  if (filtered.length === 0) {
    return res.status(404).json({ error: "No consultations found for the consultant" });
  }
  res.json(filtered);
});

export default router;
