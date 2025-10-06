const mongoose = require('mongoose');
const { User, Listing, Purchase } = require('../models');

// Add a new purchase (free house purchase)
const addPurchase = async (req, res) => {
  let session;
  try {
    const { listingId, notes } = req.body;
    const buyerId = req.user.userId;
    
    if (!listingId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Listing ID is required' 
      });
    }

    // Start a MongoDB session for transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Check if listing exists and is available
    const listing = await Listing.findById(listingId)
      .populate('owner', 'name email')
      .session(session);
    
    if (!listing) {
      throw new Error('Listing not found');
    }

    const sellerId = listing.owner._id;
    const availableUnits = listing.availableUnits || 1;

    // Check if user is trying to buy their own property
    if (sellerId.toString() === buyerId) {
      throw new Error('You cannot purchase your own listing');
    }

    // Check if listing is available
    if (availableUnits <= 0) {
      throw new Error('This property is no longer available');
    }

    // Create purchase record
    const purchase = await Purchase.create([{
      listing: listingId,
      buyer: buyerId,
      notes: notes || '',
      status: 'pending'
    }], { session });

    // Update listing availableUnits
    listing.availableUnits = availableUnits - 1;
    listing.status = availableUnits - 1 <= 0 ? 'unavailable' : 'available';
    await listing.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    res.json({ 
      success: true,
      message: 'Purchase request created successfully',
      purchaseId: purchase[0]._id
    });

  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error('Error creating purchase:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ 
      success: false, 
      message: error.message || 'Failed to create purchase request'
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

// Get all purchases
const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate({
        path: 'listing',
        select: 'title price status images'
      })
      .populate({
        path: 'buyer',
        select: 'name email'
      })
      .sort({ created_at: -1 })
      .lean();

    res.json({
      success: true,
      purchases
    });
  } catch (error) {
    console.error('Error getting purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get purchases'
    });
  }
};

// Get purchase by ID
const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const purchase = await Purchase.findById(id)
      .populate({
        path: 'listing',
        select: 'title price status images location description'
      })
      .populate({
        path: 'buyer',
        select: 'name email'
      })
      .lean();

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    res.json({
      success: true,
      purchase
    });
  } catch (error) {
    console.error('Error getting purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get purchase details'
    });
  }
};

// Get purchases by buyer
const getPurchasesByBuyer = async (req, res) => {
  try {
    const buyerId = req.user.userId;
    
    const purchases = await Purchase.find({ buyer: buyerId })
      .populate({
        path: 'listing',
        select: 'title price status images location'
      })
      .sort({ created_at: -1 })
      .lean();

    res.json({
      success: true,
      purchases
    });
  } catch (error) {
    console.error('Error getting buyer purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get your purchases'
    });
  }
};

// Get purchases by listing
const getPurchasesByListing = async (req, res) => {
  try {
    const { listingId } = req.params;
    
    const purchases = await Purchase.find({ listing: listingId })
      .populate({
        path: 'buyer',
        select: 'name email'
      })
      .sort({ created_at: -1 })
      .lean();

    res.json({
      success: true,
      purchases
    });
  } catch (error) {
    console.error('Error getting listing purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get purchases for this listing'
    });
  }
};

// Update purchase status
const updatePurchaseStatus = async (req, res) => {
  let session;
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Start a session for transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Find and update purchase
    const purchase = await Purchase.findById(id).session(session);
    
    if (!purchase) {
      throw new Error('Purchase not found');
    }

    // Update purchase status
    purchase.status = status;
    await purchase.save({ session });

    // Update listing status if needed
    const listing = await Listing.findById(purchase.listing).session(session);
    
    if (listing) {
      if (status === 'cancelled' && purchase.status === 'pending') {
        // Return the unit to available units if cancelling a pending purchase
        listing.availableUnits += 1;
        listing.status = 'available';
      }
      await listing.save({ session });
    }

    await session.commitTransaction();
    
    res.json({
      success: true,
      message: 'Purchase status updated successfully',
      purchase: await Purchase.findById(id)
        .populate({
          path: 'listing',
          select: 'title status'
        })
        .populate({
          path: 'buyer',
          select: 'name email'
        })
        .lean()
    });

  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error('Error updating purchase status:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: error.message || 'Failed to update purchase status'
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

// Delete purchase
const deletePurchase = async (req, res) => {
  let session;
  try {
    const { id } = req.params;

    // Start a session for transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Find the purchase
    const purchase = await Purchase.findById(id).session(session);
    
    if (!purchase) {
      throw new Error('Purchase not found');
    }

    // If purchase is pending, update listing availability
    if (purchase.status === 'pending') {
      const listing = await Listing.findById(purchase.listing).session(session);
      if (listing) {
        listing.availableUnits += 1;
        listing.status = 'available';
        await listing.save({ session });
      }
    }

    // Delete the purchase
    await Purchase.findByIdAndDelete(id).session(session);
    
    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Purchase deleted successfully'
    });

  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error('Error deleting purchase:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: error.message || 'Failed to delete purchase'
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

module.exports = {
  addPurchase,
  getAllPurchases,
  getPurchaseById,
  updatePurchaseStatus,
  deletePurchase,
  getPurchasesByBuyer,
  getPurchasesByListing
};