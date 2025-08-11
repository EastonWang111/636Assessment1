const Vote = require('../models/Vote');
const User = require('../models/User');

// 创建投票 (仅管理员)
const createVote = async (req, res) => {
    try {
        const { title, description, options } = req.body;
        
        // 验证必填字段
        if (!title || !options || options.length < 2) {
            return res.status(400).json({ message: '标题和至少两个选项是必填的' });
        }

        const vote = new Vote({
            title,
            description,
            options: options.map(option => ({ text: option, votes: 0 })),
            createdBy: req.user.id
        });

        await vote.save();
        res.status(201).json({ message: '投票创建成功', vote });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 获取所有投票
const getVotes = async (req, res) => {
    try {
        const votes = await Vote.find().populate('createdBy', 'name email');
        res.json(votes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 获取单个投票详情
const getVoteById = async (req, res) => {
    try {
        const vote = await Vote.findById(req.params.id).populate('createdBy', 'name email');
        if (!vote) {
            return res.status(404).json({ message: '投票不存在' });
        }
        res.json(vote);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 投票
const castVote = async (req, res) => {
    try {
        const { optionIndex } = req.body;
        const voteId = req.params.id;
        const userId = req.user.id;

        const vote = await Vote.findById(voteId);
        if (!vote) {
            return res.status(404).json({ message: '投票不存在' });
        }

        if (vote.status === 'closed') {
            return res.status(400).json({ message: '投票已关闭' });
        }

        // 检查用户是否已经投票
        if (vote.voters.includes(userId)) {
            return res.status(400).json({ message: '您已经投过票了' });
        }

        // 检查选项索引是否有效
        if (optionIndex < 0 || optionIndex >= vote.options.length) {
            return res.status(400).json({ message: '无效的选项' });
        }

        // 增加选项票数
        vote.options[optionIndex].votes += 1;
        vote.voters.push(userId);

        await vote.save();
        res.json({ message: '投票成功', vote });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 更新投票 (仅管理员)
const updateVote = async (req, res) => {
    try {
        const { title, description, options } = req.body;
        
        const vote = await Vote.findById(req.params.id);
        if (!vote) {
            return res.status(404).json({ message: '投票不存在' });
        }

        if (vote.status === 'closed') {
            return res.status(400).json({ message: '已关闭的投票无法修改' });
        }

        vote.title = title || vote.title;
        vote.description = description || vote.description;
        
        // 如果提供了新选项，更新选项（保留已有票数）
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
        res.json({ message: '投票更新成功', vote });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 关闭投票 (仅管理员)
const closeVote = async (req, res) => {
    try {
        const vote = await Vote.findById(req.params.id);
        if (!vote) {
            return res.status(404).json({ message: '投票不存在' });
        }

        if (vote.status === 'closed') {
            return res.status(400).json({ message: '投票已经关闭' });
        }

        vote.status = 'closed';
        vote.closedAt = new Date();
        await vote.save();

        res.json({ message: '投票已关闭', vote });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 删除投票 (仅管理员)
const deleteVote = async (req, res) => {
    try {
        const voteId = req.params.id;
        const userId = req.user.id;
        
        // 检查投票是否存在
        const vote = await Vote.findById(voteId);
        if (!vote) {
            return res.status(404).json({ message: '投票不存在' });
        }

        // 记录删除操作
        console.log(`管理员 ${userId} 正在删除投票: ${vote.title} (ID: ${voteId})`);
        
        // 删除投票
        await Vote.findByIdAndDelete(voteId);
        
        console.log(`投票删除成功: ${vote.title} (ID: ${voteId})`);
        res.json({ 
            message: '投票已成功删除',
            deletedVote: {
                id: vote._id,
                title: vote.title,
                deletedAt: new Date()
            }
        });
    } catch (error) {
        console.error('删除投票时发生错误:', error);
        res.status(500).json({ 
            message: '删除投票失败，服务器内部错误',
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