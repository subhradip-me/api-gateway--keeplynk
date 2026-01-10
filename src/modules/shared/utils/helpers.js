/**
 * General helper functions
 */

/**
 * Paginate query results
 */
const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

/**
 * Sort query results
 */
const sortQuery = (query, sortBy = 'createdAt', order = 'desc') => {
  const sortOrder = order === 'desc' ? -1 : 1;
  return query.sort({ [sortBy]: sortOrder });
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate slug from text
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

/**
 * Format date
 */
const formatDate = (date) => {
  return new Date(date).toISOString();
};

/**
 * Sanitize user object (remove sensitive data)
 */
const sanitizeUser = (user) => {
  const { password, __v, ...sanitized } = user.toObject ? user.toObject() : user;
  return sanitized;
};

export {
  paginate,
  sortQuery,
  isValidEmail,
  generateSlug,
  formatDate,
  sanitizeUser
};
