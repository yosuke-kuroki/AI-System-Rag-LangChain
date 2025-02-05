import { Request, Response, NextFunction } from "express";

// Extend Express Request type to include a "user" property.
declare global {
  namespace Express {
    interface Request {
      user?: { name: string; email: string };
    }
  }
}

export function bearerAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  // For demo purposes, accept only "valid-token"
  if (token !== "psJN7z3J9q") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Attach dummy user data (could be replaced with real user lookup)
  req.user = { name: "John Doe", email: "john.doe@example.com" };
  next();
}
