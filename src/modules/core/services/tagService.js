import Tag from '../models/Tag.js';
import PersonaDataService from '../../shared/services/PersonaDataService.js';

class TagService {
  // Vibrant color palette matching AI tag colors
  static tagColors = [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#EC4899', // Pink
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#14B8A6', // Teal
    '#6366F1', // Indigo
    '#F43F5E', // Rose
    '#84CC16', // Lime
  ];

  /**
   * Intelligently assign a color to a tag based on its name
   */
  static getColorForTag(tagName) {
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
      hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.tagColors.length;
    return this.tagColors[index];
  }

  static async create(userId, persona, tagData) {
    // Auto-assign color if not provided
    if (!tagData.color) {
      tagData.color = this.getColorForTag(tagData.name);
    }
    
    const tag = await Tag.create(
      PersonaDataService.sanitizePersonaDocument(tagData, userId, persona)
    );
    return tag;
  }

  static async getAll(userId, persona, filters = {}) {
    const query = PersonaDataService.buildPersonaQuery(userId, persona, filters);
    const tags = await Tag.find(query).sort({ usageCount: -1, name: 1 }).lean();
    
    // Import Resource model dynamically to avoid circular dependencies
    const Resource = (await import('../models/Resource.js')).default;
    
    console.log('Getting usage counts for', tags.length, 'tags for user:', userId, 'persona:', persona);
    
    // Get actual usage count from resources for each tag
    const tagUsageCounts = await Promise.all(
      tags.map(async (tag) => {
        // Count resources that have this tag by ObjectId
        const count = await Resource.countDocuments({
          userId,
          persona,
          tags: tag._id
        });
        console.log(`Tag "${tag.name}" (${tag._id}): ${count} resources`);
        return { ...tag, usageCount: count };
      })
    );
    
    console.log('Returning', tagUsageCounts.length, 'tags with usage counts');
    return tagUsageCounts;
  }

  static async getById(userId, persona, tagId) {
    const tag = await Tag.findOne(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: tagId })
    );
    
    if (!tag) {
      throw new Error('Tag not found');
    }
    
    return tag;
  }

  static async update(userId, persona, tagId, updateData) {
    const tag = await Tag.findOneAndUpdate(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: tagId }),
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!tag) {
      throw new Error('Tag not found');
    }
    
    return tag;
  }

  static async delete(userId, persona, tagId) {
    const tag = await Tag.findOneAndDelete(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: tagId })
    );
    
    if (!tag) {
      throw new Error('Tag not found');
    }
    
    return tag;
  }

  static async incrementUsageCount(userId, persona, tagId) {
    const tag = await Tag.findOneAndUpdate(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: tagId }),
      { $inc: { usageCount: 1 } },
      { new: true }
    );
    
    return tag;
  }

  static async getPopularTags(userId, persona, limit = 10) {
    return await Tag.find(
      PersonaDataService.buildPersonaQuery(userId, persona)
    )
      .sort({ usageCount: -1 })
      .limit(limit);
  }
}

export default TagService;
