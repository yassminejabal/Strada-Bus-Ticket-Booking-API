export default (err, req, res, next) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Une erreur interne est survenue.';

  res.status(status).json({
    error: {
      code: code,
      message: message
    }
  });
};