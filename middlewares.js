const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Token is Required' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token is Expired' });
        }
        console.log("decode=",decoded)
        req.user = decoded;
        console.log("req.user=",req.user)
        next();
    });
}; 
