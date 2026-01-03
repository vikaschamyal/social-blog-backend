const Journal = require("../models/Journal");

// POST /api/journals
const createJournal = async (req, res) => {
  try {
    const journal = await Journal.create({
      content: req.body.content,
      user: req.user._id
    });

    res.status(201).json(journal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/journals/mine
const getMyJournals = async (req, res) => {
  try {
    const journals = await Journal.find({ user: req.user._id });
    res.json(journals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createJournal,
  getMyJournals
};
