import { ZodError } from 'zod';
import { ApiError } from '../utils/api-error.js';

/**
 * Validation middleware factory
 * @param {Object} schema - Zod schema object with optional body, query, params properties
 */
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate different parts of the request
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return next(
          new ApiError(400, 'Validation failed', formattedErrors)
        );
      }
      
      next(error);
    }
  };
};
