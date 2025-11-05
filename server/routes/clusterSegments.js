import { Router } from "express";

import { clusterSegments } from "../services/clustering.js";

const router = Router();

router.post("/cluster-segments", async (req, res) => {
  const { segments } = req.body;
  if (!Array.isArray(segments)) {
    return res.status(400).json({ error: "segments[] required" });
  }

  try {
    const clusters = await clusterSegments(segments);
    res.json({ clusters });
  } catch (err) {
    console.error("Error in /cluster-segments:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

