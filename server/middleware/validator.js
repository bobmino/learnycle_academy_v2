const Joi = require('joi');

/**
 * Validation middleware factory
 * @param {Joi.ObjectSchema} schema - Joi schema to validate against
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }
    
    next();
  };
};

// Validation Schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('student', 'teacher', 'prospect').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const moduleSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).required(),
  caseStudyType: Joi.string().valid('none', 'cafe', 'restaurant', 'hotel').optional(),
  order: Joi.number().optional()
});

const lessonSchema = Joi.object({
  module: Joi.string().required(),
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().min(10).required(),
  order: Joi.number().optional()
});

const prospectFormSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  interests: Joi.string().optional()
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  moduleSchema,
  lessonSchema,
  prospectFormSchema
};
