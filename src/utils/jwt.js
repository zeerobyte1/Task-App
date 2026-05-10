import jwt from 'jsonwebtoken';
import { promisify } from 'util';

const getJwtConfig = () => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '30d';

    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return { secret, expiresIn };
};

// Function to generate a JWT token
const generateToken = (userId) => {
    const { secret, expiresIn } = getJwtConfig();
    const token = jwt.sign({ id: userId }, secret, { expiresIn });
    return token;
};

// Function to verify a JWT token
const verifyToken = async (token) => {
    try {
        const { secret } = getJwtConfig();
        const decoded = await promisify(jwt.verify)(token, secret);
        return decoded;
    } catch (error) {
        console.log('JWT verification error:', error.message);
        throw new Error('Invalid token');
    }
};

export default {
    generateToken,
    verifyToken,
};