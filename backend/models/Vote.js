const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    options: [{
        text: { type: String, required: true },
        votes: { type: Number, default: 0 }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // 记录已投票用户
    createdAt: { type: Date, default: Date.now },
    closedAt: { type: Date }
});

module.exports = mongoose.model('Vote', voteSchema);