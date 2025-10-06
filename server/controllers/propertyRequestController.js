const { PropertyRequest, Listing } = require('../models');

// Create a new property request
exports.createPropertyRequest = async (req, res) => {
  try {
    const { listingId, message } = req.body;
    const userId = req.user.userId;

    // Check if a request already exists
    const existingRequest = await PropertyRequest.findOne({
      user: userId,
      listing: listingId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this property'
      });
    }

    // Create new request
    const propertyRequest = await PropertyRequest.create({
      user: userId,
      listing: listingId,
      message
    });

    await propertyRequest.populate('user', 'name email');
    await propertyRequest.populate('listing', 'title location');

    res.status(201).json({
      success: true,
      message: 'Property request created successfully',
      request: propertyRequest
    });

  } catch (error) {
    console.error('Error creating property request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create property request'
    });
  }
};

// Get requests for a user
exports.getUserRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await PropertyRequest.find({ user: userId })
      .populate('listing', 'title location price images')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error('Error getting user requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get property requests'
    });
  }
};

// Get requests for an owner's properties
exports.getOwnerRequests = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    // First, get all listings owned by this user
    const listings = await Listing.find({ owner: ownerId }, '_id');
    const listingIds = listings.map(listing => listing._id);

    // Then get all requests for these listings
    const requests = await PropertyRequest.find({
      listing: { $in: listingIds }
    })
      .populate('user', 'name email')
      .populate('listing', 'title location price images')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error('Error getting owner requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get property requests'
    });
  }
};

// Update request status (approve/reject)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, response } = req.body;
    const ownerId = req.user.userId;

    // Find the request
    const propertyRequest = await PropertyRequest.findById(requestId)
      .populate('listing');

    if (!propertyRequest) {
      return res.status(404).json({
        success: false,
        message: 'Property request not found'
      });
    }

    // Verify that the owner owns this property
    if (propertyRequest.listing.owner.toString() !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this request'
      });
    }

    // Update the request
    propertyRequest.status = status;
    propertyRequest.response = response || '';
    await propertyRequest.save();

    await propertyRequest.populate('user', 'name email');
    await propertyRequest.populate('listing', 'title location price images');

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      request: propertyRequest
    });

  } catch (error) {
    console.error('Error updating property request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property request'
    });
  }
};

// Delete a request
exports.deleteRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.userId;

    const request = await PropertyRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Property request not found'
      });
    }

    // Verify that the user owns this request
    if (request.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this request'
      });
    }

    await request.deleteOne();

    res.json({
      success: true,
      message: 'Property request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting property request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property request'
    });
  }
};