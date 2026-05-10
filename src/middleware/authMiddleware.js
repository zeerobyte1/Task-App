import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = (req, res, next) => {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
        return res.status(500).json({
            error: "SERVER_MISCONFIGURED",
            message: "JWT_SECRET is not configured on the server"
        });
    }

    let token;

    // Try to get token from Authorization header first
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7, authHeader.length)
            : authHeader;
    } 
    // Fallback to cookie
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({
            error: "UNAUTHORIZED",
            message: "No token provided"
        });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({
                error: "INVALID_TOKEN",
                message: "Token is not valid"
            });
        }

        try {
            const user = await User.findById(decoded.id); // <-- FIXED: use decoded.id
            if (!user) {
                return res.status(404).json({
                    error: "USER_NOT_FOUND",
                    message: "User not found"
                });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(500).json({
                error: "SERVER_ERROR",
                message: "An error occurred while fetching user"
            });
        }
    });
};

// Export both as default and named export for compatibility
export { authMiddleware as authenticateToken };
export default authMiddleware;
