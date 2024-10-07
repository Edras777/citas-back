const noEncontrado = (req, res, next) => {
  const error = new Error(`No Encontrado - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const manejadorError = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    resultado: null,
    ocurrioError: true,
    mensaje: err.message,
  });
};

export { noEncontrado, manejadorError };
