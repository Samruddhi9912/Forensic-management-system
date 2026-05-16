const Case = require("../models/Case");

const generateCaseId = async () => {

  const count = await Case.countDocuments();

  return `C${count + 1}`;

};

module.exports = generateCaseId;