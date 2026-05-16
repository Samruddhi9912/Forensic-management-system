const Case = require("../models/Case");

const generateCaseId = require("../utils/generateCaseId");


// CREATE CASE
const createCase = async (req, res) => {
  try {

    const {
      evidenceType,
      policeDescription
    } = req.body;

    const newCase = await Case.create({
      caseId: await generateCaseId(),
      evidenceType,
      policeDescription,
      createdBy: req.user.id
    });

    res.status(201).json(newCase);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// FETCH CASES
const getCases = async (req, res) => {
  try {

    let cases;

    // POLICE -> only own cases
    if (req.user.role === "police") {

      cases = await Case.find({
        createdBy: req.user.id
      });

    }

    // LAB -> only ongoing cases
    else if (req.user.role === "lab") {

      cases = await Case.find({
        status: "ongoing"
      });

    }

    res.json(cases);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// UPDATE CASE
const updateCase = async (req, res) => {
  try {

    const currentCase = await Case.findById(req.params.id);

    if (!currentCase) {
      return res.status(404).json({
        message: "Case not found"
      });
    }

    // POLICE UPDATE
    if (req.user.role === "police") {

      // only own case
      if (
        currentCase.createdBy.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message: "Unauthorized"
        });
      }

      currentCase.evidenceType =
        req.body.evidenceType ||
        currentCase.evidenceType;

      currentCase.policeDescription =
        req.body.policeDescription ||
        currentCase.policeDescription;

      currentCase.status =
        req.body.status ||
        currentCase.status;
    }


    // LAB UPDATE
    if (req.user.role === "lab") {

      currentCase.evidenceIdentification =
        req.body.evidenceIdentification ||
        currentCase.evidenceIdentification;

      currentCase.labReport =
        req.body.labReport ||
        currentCase.labReport;
    }

    await currentCase.save();

    res.json(currentCase);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createCase,
  getCases,
  updateCase
};