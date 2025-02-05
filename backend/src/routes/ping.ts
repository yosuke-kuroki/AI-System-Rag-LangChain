import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /ping
 * Returns the authenticated user details.
 */
router.get("/", (req: Request, res: Response) => {
  // req.user was attached by the bearerAuth middleware.
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json({
    name: req.user.name,
    email: req.user.email
  });
});

export default router;
