import { Router, Request, Response } from "express";
import archiver from "archiver";
import fs from "fs";
import path from "path";

const router = Router();

/**
 * GET /api/documents/download
 * Zips and downloads all documents from the documents folder.
 */
router.get("/download", (req: Request, res: Response) => {
  const documentsDir = path.join(__dirname, "../../documents");

  // Check if directory exists
  if (!fs.existsSync(documentsDir)) {
    return res.status(500).json({ error: "Documents directory not found." });
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="documents.zip"');

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("error", (err) => {
    res.status(500).send({ error: err.message });
  });

  // Pipe archive data to the response.
  archive.pipe(res);

  // Append all files from the documents folder.
  archive.directory(documentsDir, false);
  archive.finalize();
});

export default router;
