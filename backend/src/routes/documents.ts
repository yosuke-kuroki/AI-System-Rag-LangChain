import { Router, Request, Response } from "express";
import archiver from "archiver";
import fs from "fs";
import path from "path";

const router = Router();

/**
 * @openapi
 * /api/documents/download:
 *   get:
 *     summary: Zips and downloads all documents from the documents folder.
 *     tags:
 *       - Documents
 *     responses:
 *       200:
 *         description: A zip file containing the documents.
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Documents directory not found or an error occurred while creating the zip.
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
