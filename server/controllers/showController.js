const { Show } = require('../models');

// Format date helper
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Get all shows
exports.getAllShows = async (req, res) => {
  try {
    const shows = await Show.find()
      .sort({ show_date: 1, start_time: 1 })
      .lean();
    
    res.json(shows);
  } catch (err) {
    console.error('Error fetching shows:', err);
    res.status(500).json({ error: 'Failed to fetch shows', details: err.message });
  }
};

// Get show by ID
exports.getShowById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.execute(
      `SELECT * FROM theater_shows WHERE show_id = :id`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Show not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching show:', err);
    res.status(500).json({ error: 'Failed to fetch show', details: err.message });
  }
};

// Create a new show
exports.createShow = async (req, res) => {
  try {
    const {
      title,
      description,
      show_date,
      start_time,
      end_time,
      price,
      total_seats,
      venue,
      category
    } = req.body;

    // Validate required fields
    if (!title || !show_date || !start_time || !price || !total_seats || !venue) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create new show using Mongoose
    const show = new Show({
      title,
      description: description || '',
      show_date: new Date(show_date),
      start_time,
      end_time: end_time || '',
      price,
      total_seats,
      available_seats: total_seats, // Initially all seats are available
      venue,
      category: category || '',
      created_at: new Date()
    });

    await show.save();
    res.status(201).json(show);
  } catch (err) {
    console.error('Error creating show:', err);
    res.status(500).json({ error: 'Failed to create show', details: err.message });
  }
};

// Update a show
exports.updateShow = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      show_date,
      start_time,
      end_time,
      price,
      total_seats,
      available_seats,
      venue,
      category
    } = req.body;

    // Validate required fields
    if (!title || !show_date || !start_time || !price || !total_seats || !venue) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const updatedShow = await Show.findByIdAndUpdate(
      id,
      {
        title,
        description: description || '',
        show_date: new Date(show_date),
        start_time,
        end_time: end_time || '',
        price,
        total_seats,
        available_seats,
        venue,
        category: category || '',
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedShow) {
      return res.status(404).json({ error: 'Show not found' });
    }

    res.json(updatedShow);
  } catch (err) {
    console.error('Error updating show:', err);
    res.status(500).json({ error: 'Failed to update show', details: err.message });
  }
};

// Delete a show
exports.deleteShow = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedShow = await Show.findByIdAndDelete(id);

    if (!deletedShow) {
      return res.status(404).json({ error: 'Show not found' });
    }

    res.json({ message: 'Show deleted successfully' });
  } catch (err) {
    console.error('Error deleting show:', err);
    res.status(500).json({ error: 'Failed to delete show', details: err.message });
  }
};