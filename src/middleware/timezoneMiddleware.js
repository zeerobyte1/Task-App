const timezoneMiddleware = (req, res, next) => {
    // Set the timezone to Asia/Kolkata
    req.timezone = 'Asia/Kolkata';
    
    // Convert from UTC to IST (UTC+5:30)
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(utcMs + istOffsetMs);

    req.currentTime = istTime.toISOString();

    next();
};

export default timezoneMiddleware;
