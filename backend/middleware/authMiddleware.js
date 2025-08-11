
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }

    // check Administrator account
    const adminOnly = async (req, res, next) => {
        try{
            if (!req.user){
                return res.status(401).json({ message: 'please login! '});
            }

            if (res.user.role !== 'admin'){
                return res.status(403).json({ message: 'Only administrators can run this function'})
            }

            next();

        } catch(error){
            res.status(500).json({ message: error.message});
        }
    }
};

module.exports = { protect ,adminOnly };
