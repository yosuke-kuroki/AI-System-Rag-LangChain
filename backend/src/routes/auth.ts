import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /auth/token
 * Returns a dummy bearer token.
 */
router.get("/token", (req: Request, res: Response) => {
  res.json({ token: "valid-token" });
});

export default router;
