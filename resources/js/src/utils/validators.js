/**
 * Simple validation helpers (no external library needed).
 * Each function returns an error message string, or '' if valid.
 */

export const required = (value, label = 'This field') =>
  value === undefined || value === null || String(value).trim() === ''
    ? `${label} is required`
    : '';

export const minLength = (value, min, label = 'This field') =>
  String(value).length < min ? `${label} must be at least ${min} characters` : '';

export const maxLength = (value, max, label = 'This field') =>
  String(value).length > max ? `${label} must be at most ${max} characters` : '';

export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email address';

export const isPhone = (value) =>
  /^\+?[0-9\s\-()]{7,15}$/.test(value) ? '' : 'Enter a valid phone number';

export const isPositiveNumber = (value, label = 'Amount') =>
  isNaN(value) || Number(value) <= 0 ? `${label} must be a positive number` : '';

export const passwordsMatch = (pass, confirm) =>
  pass !== confirm ? 'Passwords do not match' : '';

/**
 * Runs an array of validator fns and returns the first error found.
 * Usage: runValidators(email, [required, isEmail])
 */
export const runValidators = (value, validators = []) => {
  for (const fn of validators) {
    const err = fn(value);
    if (err) return err;
  }
  return '';
};

/**
 * Validates a full form object against a schema of { field: [validators] }.
 * Returns { fieldName: errorMessage } for any failing fields.
 */
export const validateForm = (formData, schema) => {
  const errors = {};
  for (const [field, validators] of Object.entries(schema)) {
    const err = runValidators(formData[field], validators);
    if (err) errors[field] = err;
  }
  return errors;
};
