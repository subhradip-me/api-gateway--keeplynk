import jwt from 'jsonwebtoken';
import config from '../config/environment.js';

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    console.log('🔐 authenticate middleware called');
    console.log('Authorization header:', req.header('Authorization'));
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token found');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log('✅ Token decoded:', decoded);
    req.user = decoded;
    
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
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
  console.log('🔍 personaContext middleware called');
  console.log('req.user:', req.user);
  
  if (!req.user) {
    console.log('❌ No req.user found');
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Try to get persona from JWT token first, then fall back to X-Persona header
  let persona = req.user.persona || req.user.currentPersona || req.headers['x-persona'];
  console.log('Extracted persona:', persona);
  
  // If still no persona, try to get from user's personas array (use first one)
  if (!persona && req.user.personas && req.user.personas.length > 0) {
    persona = req.user.personas[0];
    console.log('📌 Using first persona from user.personas:', persona);
  }
  
  // If still no persona, default to 'genaral'
  if (!persona) {
    persona = 'genaral';
    console.log('⚠️ No persona found, defaulting to "genaral"');
  }
  
  req.personaContext = {
    userId: req.user.userId || req.user._id,
    persona: persona,
    email: req.user.email
  };
  
  console.log('✅ personaContext set:', req.personaContext);
  next();
};

export {
  authenticate,
  validatePersona,
  requirePersona,
  personaContext
};
