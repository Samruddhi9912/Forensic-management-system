const router = require('express').Router();
const Case = require('../models/case');
const auth = require('../middlewares/authmiddleware');

// Add Case
router.post('/add', auth, async (req, res) => {
  try {
    if (req.user.role !== 'lab')
      return res.status(403).json({ msg: "Access denied" });

    const { caseId, evidenceIdentification, description, status } = req.body;

    if (!caseId || !description)
      return res.status(400).json({ msg: "Required fields missing" });

    const newCase = new Case({
      caseId,
      evidenceIdentification,
      description,
      status,
      labUpdated: true
    });

    await newCase.save();
    res.json(newCase);

  } catch {
    res.status(400).json({ msg: "Case ID already exists" });
  }
});

// Update Case
router.put('/update/:caseId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'lab')
      return res.status(403).json({ msg: "Access denied" });

    const updated = await Case.findOneAndUpdate(
      { caseId: req.params.caseId },
      { ...req.body, labUpdated: true },
      { new: true }
    );

    res.json(updated);

  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

// Stats
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'lab')
      return res.status(403).json({ msg: "Access denied" });

    const total = await Case.countDocuments();
    const ongoing = await Case.countDocuments({ status: 'ongoing' });
    const completed = await Case.countDocuments({ status: 'completed' });
    const updated = await Case.countDocuments({ labUpdated: true });

    res.json({ total, ongoing, completed, updated });

  } catch {
    res.status(500).json({ msg: "Error fetching data" });
  }
});

// Get all cases
router.get('/all', auth, async (req, res) => {
  try {
    const cases = await Case.find();
    res.json(cases);
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;