const express = require('express');
const router = express.Router();   
const {
    createVote,
    getVotes,
    getVoteById,
    castVote,
    updateVote,
    closeVote,
    deleteVote
} = require('../controllers/voteController');
const { protect, adminOnly } = require('../middleware/authMiddleware');


//All routes require authentication
router.use(protect);

// Get all votes - All users can view
router.get('/', getVotes);

// Get individual voting details - All users can view the results
router.get('/:id', getVoteById);

// User Voting - Ordinary users can vote
router.post('/:id/cast', castVote);

// The following routes can only be accessed by administrators 
// Create a vote (for administrators only)
router.post('/', adminOnly, createVote);

//update vote
router.put('/:id', adminOnly, updateVote);

//close vote
router.patch('/:id/close', adminOnly, closeVote);

//deleted vote
router.delete('/:id', adminOnly, deleteVote);

module.exports = router;
