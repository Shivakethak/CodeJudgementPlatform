const sanitizeObject = (input) => {
  if (!input || typeof input !== 'object') return input;
  if (Array.isArray(input)) return input.map(sanitizeObject);

  for (const key of Object.keys(input)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete input[key];
      continue;
    }
    input[key] = sanitizeObject(input[key]);
  }
  return input;
};

const sanitizeRequest = (req, res, next) => {
  if (req.body && typeof req.body === 'object') sanitizeObject(req.body);
  if (req.query && typeof req.query === 'object') sanitizeObject(req.query);
  if (req.params && typeof req.params === 'object') sanitizeObject(req.params);
  next();
};

module.exports = { sanitizeRequest };
