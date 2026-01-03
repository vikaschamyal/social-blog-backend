const express = require("express");
const router = express.Router();

const Journal = require("../models/Journal");
const { verifyToken } = require("../middleware/auth"); // ✅ FIX

// Create journal (PRIVATE)
router.post("/", verifyToken, async (req, res) => {
  try {
    const journal = await Journal.create({
      user: req.body.userId,   // 👈 comes from verifyToken
      content: req.body.content,
    });

    res.status(201).json(journal);
  } catch (err) {
    res.status(500).json({ error: "Failed to create journal" });
  }
});

// Get my journals (PRIVATE)
router.get("/mine", verifyToken, async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.body.userId });
    res.json(journals);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch journals" });
  }
});

module.exports = router;
