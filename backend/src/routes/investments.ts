import { Router, Request, Response } from "express";
import { investments } from "../data/data";

const router = Router();

/**
 * GET /api/investments
 * Returns investment details for a company (excludes insights).
 * Query parameter: company_name (required)
 */
router.get("/", (req: Request, res: Response) => {
  const companyQuery = req.query.company_name as string;
  if (!companyQuery) {
    return res.status(400).json({ error: "Query parameter 'company_name' is required" });
  }
  const investment = investments.find(
    (inv) => inv.company_name.toLowerCase() === companyQuery.toLowerCase()
  );
  if (!investment) {
    return res.status(404).json({ error: "Company not found" });
  }
  const { company_name, location, website, sectors } = investment;
  res.json({ company_name, location, website, sectors });
});

/**
 * GET /api/investments/insights
 * Returns only the insights for a company.
 * Query parameter: company_name (required)
 */
router.get("/insights", (req: Request, res: Response) => {
  const companyQuery = req.query.company_name as string;
  if (!companyQuery) {
    return res.status(400).json({ error: "Query parameter 'company_name' is required" });
  }
  const investment = investments.find(
    (inv) => inv.company_name.toLowerCase() === companyQuery.toLowerCase()
  );
  if (!investment) {
    return res.status(404).json({ error: "Company not found" });
  }
  res.json(investment.insights);
});

export default router;
