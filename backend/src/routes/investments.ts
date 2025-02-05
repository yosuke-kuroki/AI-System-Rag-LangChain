import { Router, Request, Response } from "express";
import Investment from "../models/Investment";

const router = Router();

/**
 * @openapi
 * /api/investments:
 *   get:
 *     summary: Returns investment details for a company (excludes insights).
 *     tags:
 *       - Investments
 *     parameters:
 *       - in: query
 *         name: company_name
 *         required: true
 *         schema:
 *           type: string
 *         description: The company name to retrieve.
 *     responses:
 *       200:
 *         description: Investment details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company_name:
 *                   type: string
 *                 location:
 *                   type: string
 *                 website:
 *                   type: string
 *                 sectors:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Query parameter "company_name" is missing.
 *       404:
 *         description: Company not found.
 *       500:
 *         description: Server error.
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const companyQuery = req.query.company_name as string;
    if (!companyQuery) {
      return res
        .status(400)
        .json({ error: "Query parameter 'company_name' is required" });
    }

    // Search case-insensitively using a regular expression.
    const investment = await Investment.findOne({
      company_name: { $regex: new RegExp(`^${companyQuery}$`, "i") },
    }).lean();

    if (!investment) {
      return res.status(404).json({ error: "Company not found" });
    }

    const { company_name, location, website, sectors } = investment;
    res.json({ company_name, location, website, sectors });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * @openapi
 * /api/investments/insights:
 *   get:
 *     summary: Returns only the insights for a company.
 *     tags:
 *       - Investments
 *     parameters:
 *       - in: query
 *         name: company_name
 *         required: true
 *         schema:
 *           type: string
 *         description: The company name to retrieve insights for.
 *     responses:
 *       200:
 *         description: A list of insights.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Query parameter "company_name" is missing.
 *       404:
 *         description: Company not found.
 *       500:
 *         description: Server error.
 */
router.get("/insights", async (req: Request, res: Response) => {
  try {
    const companyQuery = req.query.company_name as string;
    if (!companyQuery) {
      return res
        .status(400)
        .json({ error: "Query parameter 'company_name' is required" });
    }

    const investment = await Investment.findOne({
      company_name: { $regex: new RegExp(`^${companyQuery}$`, "i") },
    }).lean();

    if (!investment) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json(investment.insights);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
