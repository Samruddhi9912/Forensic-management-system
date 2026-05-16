const express = require("express");

const router = express.Router();

const Case = require("../models/Case");

const authMiddleware =
  require("../middleware/authMiddleware");



/* CREATE CASE */

router.post("/", authMiddleware, async (req, res) => {

  try {

    const totalCases =
      await Case.countDocuments();

    const newCase = new Case({

      caseId: `C${totalCases + 1}`,

      evidenceType:
        req.body.evidenceType,

      policeDescription:
        req.body.policeDescription,

      evidenceIdentification: "",

      labReport: "",

      status: "ongoing",

      createdBy: req.user.id

    });


    const savedCase =
      await newCase.save();

    res.status(201).json(savedCase);

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }

});



/* FETCH CASES */

router.get("/", authMiddleware, async (req, res) => {

  try {

    let cases;



    /* POLICE -> ONLY OWN CASES */

    if (
      req.user.role.toLowerCase()
      === "police"
    ) {

      cases = await Case.find({

        createdBy: req.user.id

      });

    }



    /* LAB -> ONLY ONGOING CASES */

    else if (
      req.user.role.toLowerCase()
      === "lab"
    ) {

      cases = await Case.find({

        status: "ongoing"

      });

    }


    res.json(cases);

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }

});



/* UPDATE CASE */

router.put("/:id", authMiddleware, async (req, res) => {

  try {

    console.log("BODY:", req.body);

    console.log("USER:", req.user);


    const foundCase =
      await Case.findById(req.params.id);


    if (!foundCase) {

      return res.status(404).json({
        message: "Case not found"
      });

    }



    /* POLICE */

    if (
      req.user.role.toLowerCase()
      === "police"
    ) {

      if (
        foundCase.createdBy.toString()
        !== req.user.id
      ) {

        return res.status(403).json({
          message: "Access denied"
        });

      }


      if (req.body.evidenceType !== undefined) {

        foundCase.evidenceType =
          req.body.evidenceType;

      }


      if (req.body.policeDescription !== undefined) {

        foundCase.policeDescription =
          req.body.policeDescription;

      }


      if (req.body.status !== undefined) {

        foundCase.status =
          req.body.status;

      }

    }



    /* LAB */

    if (
      req.user.role.toLowerCase()
      === "lab"
    ) {

      console.log("LAB BLOCK EXECUTED");


      if (req.body.labReport !== undefined) {

        foundCase.labReport =
          req.body.labReport;

      }


      if (
        req.body.evidenceIdentification
        !== undefined
      ) {

        foundCase.evidenceIdentification =
          req.body.evidenceIdentification;

      }

    }



    const updatedCase =
      await foundCase.save();


    res.json(updatedCase);

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }

});



module.exports = router;