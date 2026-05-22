// RTI Request Routes
const express = require("express");
const router = express.Router();
const {
    createRequest,
    getMyRequests,
    getAllRequests,
    updateStatus,
} = require("../controllers/rtiController");
const authMiddleware = require("../middleware/authMiddleware");

// All RTI routes require authentication
router.post("/create", authMiddleware, createRequest);
router.get("/my", authMiddleware, getMyRequests);
router.get("/all", authMiddleware, getAllRequests);
router.put("/status/:id", authMiddleware, updateStatus);

module.exports = router;
