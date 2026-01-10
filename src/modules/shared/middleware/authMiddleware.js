import jwt from 'jsonwebtoken';
import config from '../config/environment.js';

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

/**
 * Validate that user has access to the specified persona
 */
const validatePersona = (req, res, next) => {
  try {
    const { persona } = req.user;
    const requestedPersona = req.params.persona || req.body.persona || req.query.persona;
    
    // If no specific persona requested, use current persona
    if (!requestedPersona) {
      req.persona = persona;
      return next();
    }

    // Validate persona exists in user's personas
    if (!req.user.personas?.includes(requestedPersona)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: You do not have this persona' 
      });
    }

    req.persona = requestedPersona;
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Persona validation failed' 
    });
  }
};

/**
 * Require specific persona(s)
 */
const requirePersona = (...allowedPersonas) => {
  return (req, res, next) => {
    const { persona } = req.user;
    
    if (!allowedPersonas.includes(persona)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied: This endpoint requires one of these personas: ${allowedPersonas.join(', ')}` 
      });
    }
    
    next();
  };
};

/**
 * Attach persona context to request
 */
const personaContext = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  req.personaContext = {
    userId: req.user.userId || req.user._id,
    persona: req.user.persona || req.user.currentPersona,
    email: req.user.email
  };
  next();
};

export {
  authenticate,
  validatePersona,
  requirePersona,
  personaContext
};
