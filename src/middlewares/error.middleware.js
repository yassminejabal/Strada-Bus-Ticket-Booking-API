const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur interne du serveur';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Ressource introuvable. ID invalide : ${err.value}`;
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'La valeur saisie existe déjà. Veuillez en utiliser une autre.';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(el => el.message).join('. ');
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token invalide. Veuillez vous reconnecter.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expiré. Veuillez vous reconnecter.';
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
  });
};

export default errorHandler;