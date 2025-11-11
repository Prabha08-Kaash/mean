// routes/locationRoutes.js
const express = require("express");
const router = express.Router();
const { getIndiaStates, getCitiesByState, getPincodeByCity } = require("../controllers/locationController.js");

// ✅ Route to get all states of India
router.get("/states", getIndiaStates);

// ✅ Route to get cities by state code (India fixed)
router.get("/states/:stateCode/cities", getCitiesByState);

router.get("/city/:city/pincode", getPincodeByCity);

module.exports = router;
