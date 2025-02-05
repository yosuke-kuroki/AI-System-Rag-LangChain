import { Router, Request, Response } from "express";

const router = Router();

/**
 * @openapi
 * /auth/token:
 *   get:
 *     summary: Returns a dummy bearer token.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: A dummy bearer token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "psJN7z3J9q"
 */
router.get("/token", (req: Request, res: Response) => {
  res.json({ token: "psJN7z3J9q" });
});

export default router;
