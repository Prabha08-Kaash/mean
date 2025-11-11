const express = require('express');
const router = express.Router();
const multer = require("multer")
const proofController = require('../controllers/proofController.js')
const upload = multer({ dest: 'uploads/' });

router.post('/generate-otp', proofController.generateOtp);
router.post('/verify-otp', upload.single('photo'), proofController.verifyOtp);

module.exports = router;
