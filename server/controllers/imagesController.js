const { Image } = require('../models');

// Get all images for a listing
exports.getListingImages = async (req, res) => {
  try {
    const { listingId } = req.params;
    
    const images = await Image.find({ listing_id: listingId })
      .sort({ sort_order: 1 })
      .lean();
    
    res.json(images);
  } catch (err) {
    console.error('Get listing images error:', err);
    res.status(500).json({ error: 'Failed to fetch listing images', details: err.message });
  }
};

// Add image to listing
exports.addImage = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { image_url, image_name, image_size, image_width, image_height, is_primary, sort_order } = req.body;
    
    const result = await db.execute(
      `BEGIN add_image(:listing_id, :image_url, :image_name, :image_size, :image_width, :image_height, :is_primary, :sort_order, :image_id); END;`,
      {
        listing_id: listingId,
        image_url: image_url,
        image_name: image_name || null,
        image_size: image_size || null,
        image_width: image_width || null,
        image_height: image_height || null,
        is_primary: is_primary || 0,
        sort_order: sort_order || 0,
        image_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    
    const image = new Image({
      listing_id: listingId,
      url: image_url,
      name: image_name,
      size: image_size,
      width: image_width,
      height: image_height,
      is_primary: is_primary || false,
      sort_order: sort_order || 0
    });

    await image.save();
    res.status(201).json(image);
  } catch (err) {
    console.error('Add image error:', err);
    res.status(500).json({ error: 'Failed to add image', details: err.message });
  }
};

// Update image
exports.updateImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { image_name, is_primary, sort_order } = req.body;
    
    const updateData = {
      ...(image_name !== undefined && { name: image_name }),
      ...(is_primary !== undefined && { is_primary }),
      ...(sort_order !== undefined && { sort_order }),
      updated_at: new Date()
    };

    if (Object.keys(updateData).length === 0) {
      return res.json({ message: 'No fields to update' });
    }

    const image = await Image.findByIdAndUpdate(
      imageId,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json(image);
  } catch (err) {
    console.error('Update image error:', err);
    res.status(500).json({ error: 'Failed to update image', details: err.message });
  }
};

// Delete image
exports.deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const image = await Image.findByIdAndDelete(imageId);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ error: 'Failed to delete image', details: err.message });
  }
};

// Reorder images for a listing
exports.reorderImages = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { imageIds } = req.body; // Array of image IDs in new order
    
    if (!Array.isArray(imageIds)) {
      return res.status(400).json({ error: 'imageIds must be an array' });
    }

    // Update sort order for each image using bulkWrite
    await Image.bulkWrite(
      imageIds.map((imageId, index) => ({
        updateOne: {
          filter: { _id: imageId, listing_id: listingId },
          update: { $set: { sort_order: index } }
        }
      }))
    );

    res.json({ message: 'Images reordered successfully' });
  } catch (err) {
    console.error('Reorder images error:', err);
    res.status(500).json({ error: 'Failed to reorder images', details: err.message });
  }
};

// Set primary image
exports.setPrimaryImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    // First, get the listing_id for this image
    const image = await Image.findById(imageId);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Update in a transaction
    const session = await Image.startSession();
    await session.withTransaction(async () => {
      // Remove primary flag from all images in this listing
      await Image.updateMany(
        { listing_id: image.listing_id },
        { is_primary: false },
        { session }
      );

      // Set this image as primary
      await Image.findByIdAndUpdate(
        imageId,
        { is_primary: true },
        { session }
      );
    });
    await session.endSession();

    res.json({ message: 'Primary image set successfully' });
  } catch (err) {
    console.error('Set primary image error:', err);
    res.status(500).json({ error: 'Failed to set primary image', details: err.message });
  }
};
