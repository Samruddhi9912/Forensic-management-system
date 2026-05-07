const router = require('express').Router();
const Case = require('../models/case');
const auth = require('../middlewares/authmiddleware');

// Add Case
router.post('/add', auth, async (req, res) => {
  try {
    if (req.user.role !== 'police')
      return res.status(403).json({ msg: "Access denied" });

    const { caseId, evidenceType, description, status } = req.body;

    if (!caseId || !description)
      return res.status(400).json({ msg: "Required fields missing" });

    const newCase = new Case({
      caseId,
      evidenceType,
      description,
      status: status || 'ongoing' // Ensure a default if not provided
    });

    await newCase.save();
    res.json(newCase);

  } catch (err) {
    res.status(400).json({ msg: "Case ID already exists or validation failed" });
  }
});

// Edit Case - CORRECTED FOR TOGGLE
router.put('/edit/:caseId', auth, async (req, res) => {
  try {
    // FIX 1: Allow BOTH 'police' and 'lab' to update status 
    // If your Lab user is the one toggling "Completed", the old code blocked them with 'Access denied'
    if (req.user.role !== 'police' && req.user.role !== 'lab') {
      return res.status(403).json({ msg: "Access denied" });
    }

    const updated = await Case.findOneAndUpdate(
      { caseId: req.params.caseId },
      { $set: req.body }, // FIX 2: Explicitly use $set for cleaner updates
      { new: true, runValidators: true } // FIX 3: runValidators ensures 'ongoing'/'completed' enum is respected
    );

    if (!updated) return res.status(404).json({ msg: "Case not found" });

    res.json(updated);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error during update" });
  }
});

// Stats
router.get('/stats', auth, async (req, res) => {
  try {
    // Ensure lab can also see stats if needed
    const total = await Case.countDocuments();
    const ongoing = await Case.countDocuments({ status: 'ongoing' });
    const completed = await Case.countDocuments({ status: 'completed' });
    const labUpdated = await Case.countDocuments({ labUpdated: true });

    res.json({ total, ongoing, completed, labUpdated });
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