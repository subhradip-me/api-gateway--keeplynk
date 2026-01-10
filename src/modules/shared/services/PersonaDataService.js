/**
 * Service for managing persona-specific data operations
 */
class PersonaDataService {
  /**
   * Build base query with userId and persona
   */
  static buildPersonaQuery(userId, persona, additionalFilters = {}) {
    return {
      userId,
      persona,
      ...additionalFilters
    };
  }

  /**
   * Validate persona access
   */
  static validatePersonaAccess(userPersonas, requestedPersona) {
    if (!userPersonas.includes(requestedPersona)) {
      throw new Error('Access denied: User does not have this persona');
    }
  }

  /**
   * Clean up all data for a specific persona
   */
  static async deletePersonaData(userId, persona, models) {
    const deletionResults = {};
    
    for (const [modelName, Model] of Object.entries(models)) {
      try {
        const result = await Model.deleteMany({ userId, persona });
        deletionResults[modelName] = result.deletedCount;
      } catch (error) {
        console.error(`Error deleting ${modelName} for persona ${persona}:`, error);
        deletionResults[modelName] = 0;
      }
    }
    
    return deletionResults;
  }

  /**
   * Get persona data statistics
   */
  static async getPersonaStats(userId, persona, models) {
    const stats = {};
    
    for (const [modelName, Model] of Object.entries(models)) {
      try {
        stats[modelName] = await Model.countDocuments({ userId, persona });
      } catch (error) {
        console.error(`Error counting ${modelName}:`, error);
        stats[modelName] = 0;
      }
    }
    
    return stats;
  }

  /**
   * Ensure document has proper persona isolation
   */
  static sanitizePersonaDocument(doc, userId, persona) {
    return {
      ...doc,
      userId,
      persona
    };
  }
}

export default PersonaDataService;
