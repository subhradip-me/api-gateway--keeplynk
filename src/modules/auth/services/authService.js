import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PersonaProfile from '../models/PersonaProfile.js';
import config from '../../shared/config/environment.js';

class AuthService {
  /**
   * Register a new user
   */
  static async register(userData) {
    const { email, password, firstName, lastName, initialPersona } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      personas: initialPersona ? [initialPersona] : [],
      currentPersona: initialPersona || null
    });

    await user.save();

    // Create initial persona profile if specified
    if (initialPersona) {
      await PersonaProfile.create({
        userId: user._id,
        persona: initialPersona,
        displayName: `${firstName} ${lastName}`
      });
    }

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Login user
   */
  static async login(email, password) {
    console.log(`[AUTH] Login attempt for email: ${email}`);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`[AUTH] User not found: ${email}`);
      throw new Error('Invalid credentials');
    }

    console.log(`[AUTH] User found: ${email}, checking password...`);
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      console.log(`[AUTH] Invalid password for: ${email}`);
      throw new Error('Invalid credentials');
    }

    console.log(`[AUTH] Login successful for: ${email}`);
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Add persona to user
   */
  static async addPersona(userId, persona) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (user.personas.includes(persona)) {
      throw new Error('User already has this persona');
    }

    // Add persona
    user.personas.push(persona);
    
    // Set as current if it's the first persona
    if (!user.currentPersona) {
      user.currentPersona = persona;
    }

    await user.save();

    // Create persona profile
    const profile = await PersonaProfile.create({
      userId: user._id,
      persona,
      displayName: `${user.firstName} ${user.lastName}`
    });

    return { user, profile };
  }

  /**
   * Switch current persona
   */
  static async switchPersona(userId, persona) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.personas.includes(persona)) {
      throw new Error('User does not have this persona');
    }

    user.currentPersona = persona;
    await user.save();

    // Generate new token with updated persona
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Remove persona from user
   */
  static async removePersona(userId, persona) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.personas.includes(persona)) {
      throw new Error('User does not have this persona');
    }

    // Remove persona
    user.personas = user.personas.filter(p => p !== persona);
    
    // Update current persona if needed
    if (user.currentPersona === persona) {
      user.currentPersona = user.personas[0] || null;
    }

    await user.save();

    // Delete persona profile
    await PersonaProfile.deleteOne({ userId: user._id, persona });

    // TODO: Delete all persona-specific data
    // This should trigger cleanup in all modules

    return user;
  }

  /**
   * Generate JWT token
   */
  static generateToken(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      personas: user.personas,
      persona: user.currentPersona
    };

    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN
    });
  }

  /**
   * Get user profile with all personas
   */
  static async getUserProfile(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const profiles = await PersonaProfile.find({ userId });

    return {
      user,
      profiles: profiles.reduce((acc, profile) => {
        acc[profile.persona] = profile;
        return acc;
      }, {})
    };
  }
}

export default AuthService;
