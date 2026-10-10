
const express = require("express");
const router = express.Router();

const {
  getAdminResults,
  getAdminResultDetails,
} = require("../controllers/adminResultsController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

// GET /api/v1/admin/results
// Get all results
router.get(
  "/",
  protect,
  authorize("admin"),
  getAdminResults
);

// GET /api/v1/admin/results/:attemptId
// Get individual result details
router.get(
  "/:attemptId",
  protect,
  authorize("admin"),
  getAdminResultDetails
);

module.exports = router;
