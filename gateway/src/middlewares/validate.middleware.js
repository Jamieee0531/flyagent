/**
 * @file validate.middleware.js
 * @description Zod request body validation middleware factory.
 *
 * Usage:
 *   const { validate } = require('../middlewares/validate.middleware');
 *   router.post('/register', validate(registerSchema), registerController);
 *
 * On validation failure returns HTTP 400 with an array of field-level errors.
 *
 * Implementation: Phase 2 (used from Phase 2 onwards)
 */

'use strict';

const { ZodError } = require('zod');

/**
 * Returns an Express middleware that validates req.body against the given
 * Zod schema. Calls next() on success, or responds with 400 on failure.
 *
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against.
 * @returns {import('express').RequestHandler}
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Format Zod issues into a simpler array for frontend consumption
      // Use .issues (canonical Zod v3 field); .errors is an alias that can be
      // undefined in edge cases when safeParse receives unexpected input types.
      const errors = (result.error.issues ?? result.error.errors ?? []).map((e) => ({
        field:   e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ error: 'Validation failed', errors });
    }
    req.body = result.data; // replace with coerced/transformed values
    return next();
  };
}

module.exports = { validate };
