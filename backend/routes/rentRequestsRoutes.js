// backend/routes/rentRequestRoutes.js
const express = require('express');
const router = express.Router();
const rentRequestController = require('../controllers/rentRequestController');

router.post('/', rentRequestController.createRequest);
router.get('/owner/:ownerId', rentRequestController.getRequestsForOwner);
router.put('/update/:requestId/status', rentRequestController.updateRequestStatus);
router.get('/user/:renterId', rentRequestController.getRequestsByUser);
router.put('/reject/:requestId', rentRequestController.rejectRequest);
router.delete('/delete/:requestId', rentRequestController.deleteRequest);


// 🆕 New admin routes
router.get('/admin/all/by-users', rentRequestController.getAllRequestsByUsers);
router.get('/admin/all/for-owners', rentRequestController.getAllRequestsForOwners);

module.exports = router;
