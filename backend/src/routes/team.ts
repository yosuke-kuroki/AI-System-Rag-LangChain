import { Router, Request, Response } from "express";
import { teamMembers } from "../data/data";

const router = Router();

/**
 * GET /api/team
 * Returns team member details (excludes related_insights).
 * Query parameter: name (required)
 */
router.get("/", (req: Request, res: Response) => {
  const nameQuery = req.query.name as string;
  if (!nameQuery) {
    return res.status(400).json({ error: "Query parameter 'name' is required" });
  }
  const member = teamMembers.find((m) => m.name.toLowerCase() === nameQuery.toLowerCase());
  if (!member) {
    return res.status(404).json({ error: "Team member not found" });
  }

  const { name, role, bio, personal_quote } = member;
  res.json({ name, role, bio, personal_quote });
});

/**
 * GET /api/team/insights
 * Returns only the related_insights for a team member.
 * Query parameter: name (required)
 */
router.get("/insights", (req: Request, res: Response) => {
  const nameQuery = req.query.name as string;
  if (!nameQuery) {
    return res.status(400).json({ error: "Query parameter 'name' is required" });
  }
  const member = teamMembers.find((m) => m.name.toLowerCase() === nameQuery.toLowerCase());
  if (!member) {
    return res.status(404).json({ error: "Team member not found" });
  }
  res.json(member.related_insights);
});

export default router;
