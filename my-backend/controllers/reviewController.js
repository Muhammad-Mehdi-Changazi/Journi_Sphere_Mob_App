const Review = require('../models/Review');

exports.getReviews = async (req, res) => {
  const { placeName } = req.query;
  try {
    const reviews = await Review.find({ placeName });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
};

// Controller to submit a review
exports.createReview = async (req, res) => {
  const { placeName, user, rating, comment } = req.body;
  console.log("User and place:", user, placeName);

  const review = new Review({ placeName, user, rating, comment });

  try {
    await review.save();
    res.status(201).json({
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ error: 'Error saving review' });
  }
};
