const express = require("express");
const router = express.Router();

const {
  getAdminResults,
} = require("../controllers/adminResultsController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

router.get(
  "/",
  protect,
  authorize("admin"),
  getAdminResults
);

module.exports = router;