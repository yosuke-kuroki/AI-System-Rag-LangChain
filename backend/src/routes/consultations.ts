import { Router, Request, Response } from "express";
import Consultation from "../models/Consultation"; // Use your Mongoose model

const router = Router();

/**
 * @openapi
 * /api/consultations:
 *   get:
 *     summary: Returns consultation details for a specific consultant.
 *     tags:
 *       - Consultations
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The consultant's name to search for within consultation details.
 *     responses:
 *       200:
 *         description: A list of consultation details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Query parameter "name" is missing.
 *       404:
 *         description: No consultations found for the consultant.
 *       500:
 *         description: Server error.
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const nameQuery = req.query.name as string;
    if (!nameQuery) {
      return res
        .status(400)
        .json({ error: "Query parameter 'name' is required" });
    }

    // Find consultations where the consultant's name is mentioned in the consultation_details field.
    const consultations = await Consultation.find({
      consultation_details: { $regex: new RegExp(nameQuery, "i") },
    }).lean();

    if (!consultations || consultations.length === 0) {
      return res
        .status(404)
        .json({ error: "No consultations found for the consultant" });
    }

    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
