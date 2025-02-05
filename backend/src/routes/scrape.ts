// @ts-nocheck
import { Router, Request, Response } from "express";
import faker from "faker";

const router = Router();

/**
 * @openapi
 * /api/scrape:
 *   get:
 *     summary: Simulates scraping an insights page and returns fake scraped data.
 *     tags:
 *       - Scrape
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: The URL of the insights page to scrape.
 *     responses:
 *       200:
 *         description: Fake scraped data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   example: "Fake Title"
 *                 content:
 *                   type: string
 *                   example: "Fake scraped content that simulates real data..."
 *                 date_published:
 *                   type: string
 *                   example: "1/1/2020"
 *       400:
 *         description: Query parameter "url" is missing.
 */
router.get("/", (req: Request, res: Response) => {
  const urlQuery = req.query.url as string;
  if (!urlQuery) {
    return res.status(400).json({ error: "Query parameter 'url' is required" });
  }

  // In a real implementation, you would fetch and parse the URL.
  // Here, we simulate by returning fake data.
  res.json({
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(2),
    date_published: faker.date.past().toLocaleDateString(),
  });
});

export default router;
