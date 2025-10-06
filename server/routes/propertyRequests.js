const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const propertyRequestController = require('../controllers/propertyRequestController');

// All routes require authentication
router.use(authenticate);

// Create a new property request
router.post('/', propertyRequestController.createPropertyRequest);

// Get user's requests
router.get('/my-requests', propertyRequestController.getUserRequests);

// Get requests for owner's properties
router.get('/owner-requests', propertyRequestController.getOwnerRequests);

// Update request status (approve/reject)
router.patch('/:requestId', propertyRequestController.updateRequestStatus);

// Delete a request
router.delete('/:requestId', propertyRequestController.deleteRequest);

module.exports = router;