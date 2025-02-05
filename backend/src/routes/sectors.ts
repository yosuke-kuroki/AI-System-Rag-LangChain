import { Router, Request, Response } from "express";
import Sector from "../models/Sector"; // Use your Mongoose model

const router = Router();

/**
 * @openapi
 * /api/sectors:
 *   get:
 *     summary: Returns details for a specific sector.
 *     tags:
 *       - Sectors
 *     parameters:
 *       - in: query
 *         name: sector
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the sector.
 *     responses:
 *       200:
 *         description: Sector details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sector:
 *                   type: string
 *                   example: "Clothing"
 *                 description:
 *                   type: string
 *                   example: "Description of the clothing sector."
 *                 companies:
 *                   type: array
 *                   items:
 *                     type: string
 *                 investment_team:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Query parameter "sector" is missing.
 *       404:
 *         description: Sector not found.
 *       500:
 *         description: Server error.
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const sectorQuery = req.query.sector as string;
    if (!sectorQuery) {
      return res
        .status(400)
        .json({ error: "Query parameter 'sector' is required" });
    }

    // Perform a case-insensitive search
    const sectorData = await Sector.findOne({
      sector: { $regex: new RegExp(`^${sectorQuery}$`, "i") },
    }).lean();

    if (!sectorData) {
      return res.status(404).json({ error: "Sector not found" });
    }

    res.json(sectorData);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
