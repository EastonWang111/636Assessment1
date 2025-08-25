const Vote = require('../models/Vote');
const User = require('../models/User');

// create vote(admin only)
const createVote = async (req, res) => {
    try {
        const { title, description, options } = req.body;
        
        // Verify mandatory fields
        if (!title || !options || options.length < 2) {
            return res.status(400).json({ message: 'The title and at least two options are mandatory' });
        }

        const vote = new Vote({
            title,

            
            description,
            options: options.map(option => ({ text: option, votes: 0 })),
            createdBy: req.user.id
        });

        await vote.save();
        res.status(201).json({ message: 'vote create successful', vote });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Obtain all votes
const getVotes = async (req, res) => {
    try {
        const votes = await Vote.find().populate('createdBy', 'name email');
        res.json(votes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtain details of a single vote
const getVoteById = async (req, res) => {
    try {
        const vote = await Vote.findById(req.params.id).populate('createdBy', 'name email');
        if (!vote) {
            return res.status(404).json({ message: 'Voting does not exist.' });
        }
        res.json(vote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// voting
const castVote = async (req, res) => {
    try {
        const { optionIndex } = req.body;
        const voteId = req.params.id;
        const userId = req.user.id;

        const vote = await Vote.findById(voteId);
        if (!vote) {
            return res.status(404).json({ message: 'Voting does not exist.' });
        }

        if (vote.status === 'closed') {
            return res.status(400).json({ message: 'Voting has been closed.' });
        }

        // Check whether the user has already cast a vote
        if (vote.voters.includes(userId)) {
            return res.status(400).json({ message: 'You have already cast your vote' });
        }

        // Check whether the option index is valid
        if (optionIndex < 0 || optionIndex >= vote.options.length) {
            return res.status(400).json({ message: 'invalid option' });
        }

        // Increase the votes for the option
        vote.options[optionIndex].votes += 1;
        vote.voters.push(userId);

        await vote.save();
        res.json({ message: 'voting sueessful', vote });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// The update of the voting options has not been completed yet.
const updateVote = async (req, res) => {
    try {
        const { title, description, options } = req.body;
        
        const vote = await Vote.findById(req.params.id);
        if (!vote) {
            return res.status(404).json({ message: 'Voting does not exist.' });
        }

        if (vote.status === 'closed') {
            return res.status(400).json({ message: 'Closed votes cannot be modified' });
        }

        vote.title = title || vote.title;
        vote.description = description || vote.description;
        
        // If new options are provided, update the options (while retaining the existing vote counts)
        if (options && options.length > 0) {
            const newOptions = options.map((option, index) => {
                const existingOption = vote.options[index];
                return {
                    text: option,
                    votes: existingOption ? existingOption.votes : 0
                };
            });
            vote.options = newOptions;
        }

        await vote.save();
        res.json({ message: 'update successful', vote });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// closed vote (admin only)
const closeVote = async (req, res) => {
    try {
        const vote = await Vote.findById(req.params.id);
        if (!vote) {
            return res.status(404).json({ message: 'Voting does not exist' });
        }

        if (vote.status === 'closed') {
            return res.status(400).json({ message: 'vote closed' });
        }

        vote.status = 'closed';
        vote.closedAt = new Date();
        await vote.save();

        res.json({ message: 'vote closed', vote });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// delete vote (admin only)
const deleteVote = async (req, res) => {
    try {
        const voteId = req.params.id;
        const userId = req.user.id;
        
        // Check if there are any votes that need to be verified.
        const vote = await Vote.findById(voteId);
        if (!vote) {
            return res.status(404).json({ message: 'Voting does not exist.' });
        }

        // Record deletion operation
        console.log(`Admin ${userId} deleting the vote: ${vote.title} (ID: ${voteId})`);
        
        // delete vote
        await Vote.findByIdAndDelete(voteId);
        
        console.log(`delete successful: ${vote.title} (ID: ${voteId})`);
        res.json({ 
            message: 'vote is delete',
            deletedVote: {
                id: vote._id,
                title: vote.title,
                deletedAt: new Date()
            }
        });
    } catch (error) {
        console.error('An error occurred when deleting a vote:', error);
        res.status(500).json({ 
            message: 'The vote deletion failed due to an internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    createVote,
    getVotes,
    getVoteById,
    castVote,
    updateVote,
    closeVote,
    deleteVote
};