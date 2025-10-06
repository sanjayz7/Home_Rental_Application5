const { Rating } = require('../models');

exports.submitRating = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { score } = req.body;
    const userId = req.user.userId;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ error: 'Score must be 1-5' });
    }

    // Upsert by unique (listing_id, user_id)
    const rating = await Rating.findOneAndUpdate(
      { listing_id: listingId, user_id: userId },
      {
        score,
        created_at: new Date()
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({ message: 'Rating saved', rating });
  } catch (err) {
    console.error('Submit rating error:', err);
    res.status(500).json({ error: 'Failed to submit rating', details: err.message });
  }
};

exports.getListingRatings = async (req, res) => {
  try {
    const { listingId } = req.params;
    const ratings = await Rating.find({ listing_id: listingId })
      .sort({ created_at: -1 })
      .populate('user_id', 'name')
      .lean();

    res.json(ratings);
  } catch (err) {
    console.error('Get ratings error:', err);
    res.status(500).json({ error: 'Failed to fetch ratings', details: err.message });
  }
};

exports.getListingAverage = async (req, res) => {
  try {
    const { listingId } = req.params;
    
    const result = await Rating.aggregate([
      { $match: { listing_id: listingId } },
      {
        $group: {
          _id: null,
          average: { $avg: '$score' },
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = result[0] || { average: null, count: 0 };
    res.json({ average: stats.average, count: stats.count });
  } catch (err) {
    console.error('Get average rating error:', err);
    res.status(500).json({ error: 'Failed to fetch average rating', details: err.message });
  }
};
