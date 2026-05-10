const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const errorResponse = {
        error: err.code || "INTERNAL_SERVER_ERROR",
        message: err.message || "An unexpected error occurred.",
        currentTime: new Date().toISOString(),
    };

    res.status(statusCode).json(errorResponse);
};

export default errorHandler;