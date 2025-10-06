const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Add a new purchase
router.post('/', purchaseController.addPurchase);

// Get all purchases (admin only)
router.get('/', purchaseController.getAllPurchases);

// Get user's purchases
router.get('/my-purchases', purchaseController.getPurchasesByBuyer);

// Get purchases for a specific listing
router.get('/listing/:listingId', purchaseController.getPurchasesByListing);

// Get purchase by ID
router.get('/:id', purchaseController.getPurchaseById);

// Update purchase status
router.patch('/:id/status', purchaseController.updatePurchaseStatus);

// Delete purchase
router.delete('/:id', purchaseController.deletePurchase);

module.exports = router;

