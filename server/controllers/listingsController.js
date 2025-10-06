const { Listing } = require('../models');

exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .sort({ created_at: -1 })
      .lean();
    
    res.json(listings);
  } catch (err) {
    console.error('Get all listings error:', err);
    res.status(500).json({ error: 'Failed to fetch listings', details: err.message });
  }
};

exports.searchListings = async (req, res) => {
  try {
    const { q, minPrice, maxPrice, category, furnished, verified, minBeds, minBaths, page = 1, pageSize = 20 } = req.query;
    const query = {};
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (category) query.category = category;
    if (furnished) query.furnished = furnished;
    if (verified) query.verified = true;
    if (minBeds) query.bedrooms = { $gte: Number(minBeds) };
    if (minBaths) query.bathrooms = { $gte: Number(minBaths) };

    const skip = (Number(page) - 1) * Number(pageSize);

    const [total, items] = await Promise.all([
      Listing.countDocuments(query),
      Listing.find(query)
        .sort({ available_from: 1, created_at: -1 })
        .skip(skip)
        .limit(Number(pageSize))
        .lean()
    ]);

    res.json({ total, items });
  } catch (err) {
    console.error('Search listings error:', err);
    res.status(500).json({ error: 'Failed to fetch listings', details: err.message });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id).lean();
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    console.error('Get listing error:', err);
    res.status(500).json({ error: 'Failed to fetch listing', details: err.message });
  }
};

exports.createListing = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const b = req.body;
    
    // Create the listing document
    const listingData = {
      owner_id: ownerId,
      title: b.title,
      description: b.description || '',
      image_url: b.image_url || '',
      address: b.address || '',
      location: b.latitude && b.longitude ? {
        type: 'Point',
        coordinates: [b.longitude, b.latitude]
      } : undefined,
      owner_phone: b.owner_phone || '',
      bedrooms: b.bedrooms || null,
      bathrooms: b.bathrooms || null,
      area_sqft: b.area_sqft || null,
      furnished: b.furnished || '',
      verified: Boolean(b.verified),
      deposit: b.deposit || null,
      available_from: b.show_date ? new Date(b.show_date) : null,
      contact_start: b.start_time || null,
      contact_end: b.end_time || null,
      price: b.price,
      total_units: b.total_seats || 1,
      available_units: b.available_seats || 1,
      city: b.venue || '',
      category: b.category || ''
    };

    // Create new listing
    const listing = await Listing.create(listingData);
    
    // Add images if provided
    if (b.images && Array.isArray(b.images) && b.images.length > 0) {
      const images = b.images.map((image, i) => ({
        url: image.url || image.preview,
        name: image.name,
        size: image.size,
        width: image.dimensions?.width,
        height: image.dimensions?.height,
        is_primary: i === 0,
        sort_order: i
      }));
      listing.images = images;
      await listing.save();
    }
    
    res.status(201).json(listing);
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ error: 'Failed to create listing', details: err.message });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body;
    
    const updateData = {
      ...(b.title && { title: b.title }),
      ...(b.description !== undefined && { description: b.description }),
      ...(b.image_url !== undefined && { image_url: b.image_url }),
      ...(b.address !== undefined && { address: b.address }),
      ...(b.latitude && b.longitude && { 
        location: {
          type: 'Point',
          coordinates: [b.longitude, b.latitude]
        }
      }),
      ...(b.owner_phone !== undefined && { owner_phone: b.owner_phone }),
      ...(b.bedrooms !== undefined && { bedrooms: b.bedrooms }),
      ...(b.bathrooms !== undefined && { bathrooms: b.bathrooms }),
      ...(b.area_sqft !== undefined && { area_sqft: b.area_sqft }),
      ...(b.furnished !== undefined && { furnished: b.furnished }),
      ...(b.verified !== undefined && { verified: Boolean(b.verified) }),
      ...(b.deposit !== undefined && { deposit: b.deposit }),
      ...(b.show_date && { available_from: new Date(b.show_date) }),
      ...(b.contact_start !== undefined && { contact_start: b.contact_start }),
      ...(b.contact_end !== undefined && { contact_end: b.contact_end }),
      ...(b.price !== undefined && { price: b.price }),
      ...(b.total_seats !== undefined && { total_units: b.total_seats }),
      ...(b.available_seats !== undefined && { available_units: b.available_seats }),
      ...(b.venue !== undefined && { city: b.venue }),
      ...(b.category !== undefined && { category: b.category }),
      updated_at: new Date()
    };

    const listing = await Listing.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    console.error('Update listing error:', err);
    res.status(500).json({ error: 'Failed to update listing', details: err.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    console.error('Delete listing error:', err);
    res.status(500).json({ error: 'Failed to delete listing', details: err.message });
  }
};

exports.verifyListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(
      id,
      { verified: true, updated_at: new Date() },
      { new: true }
    ).lean();
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json({ message: 'Listing verified' });
  } catch (err) {
    console.error('Verify listing error:', err);
    res.status(500).json({ error: 'Failed to verify listing', details: err.message });
  }
};
