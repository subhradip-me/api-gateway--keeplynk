import Resource from '../models/Resource.js';
import Tag from '../models/Tag.js';
import FolderService from './folderService.js';
import PersonaDataService from '../../shared/services/PersonaDataService.js';
import metadataService from '../../organise/services/metadataService.js';

class ResourceService {
  // Vibrant color palette for AI-assigned tags
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
   * Uses hash of tag name to consistently assign same color to same tag
   */
  static getColorForTag(tagName) {
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
      hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.tagColors.length;
    return this.tagColors[index];
  }

  static async create(userId, persona, resourceData) {
    // If no title provided and URL exists, fetch title from metadata
    if (!resourceData.title && resourceData.url && resourceData.type !== 'document') {
      try {
        console.log(`📡 No title provided, fetching from metadata for: ${resourceData.url}`);
        const metadata = await metadataService.fetchMetadata(resourceData.url);
        if (metadata.title) {
          resourceData.title = metadata.title;
          console.log(`✅ Fetched title from metadata: ${metadata.title}`);
        } else {
          // Fallback: use URL as title if metadata extraction fails
          resourceData.title = resourceData.url;
          console.log(`⚠️ No metadata title found, using URL as title`);
        }
      } catch (error) {
        console.error(`❌ Failed to fetch metadata for title:`, error.message);
        // Fallback: use URL as title
        resourceData.title = resourceData.url;
      }
    }

    // If still no title (e.g., document without title), generate a default
    if (!resourceData.title) {
      if (resourceData.type === 'document' && resourceData.fileName) {
        resourceData.title = resourceData.fileName;
      } else {
        resourceData.title = `Untitled Resource ${Date.now()}`;
      }
    }

    // If no folderId provided, use default folder
    if (!resourceData.folderId) {
      const defaultFolder = await FolderService.getOrCreateDefaultFolder(userId, persona);
      resourceData.folderId = defaultFolder._id;
    }

    // Handle tags: convert tag names to tag IDs
    if (resourceData.tags && Array.isArray(resourceData.tags)) {
      const tagIds = await this.processTagNames(userId, persona, resourceData.tags);
      resourceData.tags = tagIds;
    }
    
    // For document type, handle file information
    if (resourceData.type === 'document') {
      const fileData = {
        path: resourceData.filePath,
        name: resourceData.fileName,
        mimeType: resourceData.mimeType,
        size: resourceData.fileSize
      };
      
      // Clean up temporary fields and add to file object
      delete resourceData.filePath;
      delete resourceData.fileName;
      delete resourceData.mimeType;
      delete resourceData.fileSize;
      
      resourceData.file = fileData;
      
      // Documents don't need URL
      delete resourceData.url;
    }
    
    const resource = await Resource.create(
      PersonaDataService.sanitizePersonaDocument(resourceData, userId, persona)
    );
    return resource;
  }

  /**
   * Process tag names: find existing tags or create new ones
   * Accepts both tag names (strings) and tag IDs (ObjectIds)
   */
  static async processTagNames(userId, persona, tags) {
    const tagIds = [];
    
    for (const tag of tags) {
      // If already an ObjectId, use it
      if (typeof tag === 'object' && tag._id) {
        tagIds.push(tag._id);
        continue;
      }
      
      // If it's a string, treat it as a tag name
      if (typeof tag === 'string') {
        const tagName = tag.trim();
        if (!tagName) continue;
        
        // Find existing tag or create new one
        let existingTag = await Tag.findOne({
          userId,
          persona,
          name: tagName
        });
        
        if (!existingTag) {
          // Create new tag with intelligent color assignment
          const color = this.getColorForTag(tagName);
          existingTag = await Tag.create({
            userId,
            persona,
            name: tagName,
            color: color
          });
        }
        
        tagIds.push(existingTag._id);
      }
    }
    
    return tagIds;
  }

  static async getAll(userId, persona, filters = {}) {
    const query = PersonaDataService.buildPersonaQuery(userId, persona, filters);
    return await Resource.find(query)
      .populate('tags', 'name color')
      .sort({ createdAt: -1 });
  }

  static async getById(userId, persona, resourceId) {
    const resource = await Resource.findOne(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: resourceId })
    ).populate('tags', 'name color');
    
    if (!resource) {
      throw new Error('Resource not found');
    }
    
    return resource;
  }

  static async update(userId, persona, resourceId, updateData) {
    // Handle tags: convert tag names to tag IDs if tags are being updated
    if (updateData.tags && Array.isArray(updateData.tags)) {
      const tagIds = await this.processTagNames(userId, persona, updateData.tags);
      updateData.tags = tagIds;
    }
    
    const resource = await Resource.findOneAndUpdate(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: resourceId }),
      updateData,
      { new: true, runValidators: true }
    ).populate('tags', 'name color');
    
    if (!resource) {
      throw new Error('Resource not found');
    }
    
    return resource;
  }

  static async delete(userId, persona, resourceId) {
    const resource = await Resource.findOneAndDelete(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: resourceId })
    );
    
    if (!resource) {
      throw new Error('Resource not found');
    }
    
    return resource;
  }

  static async getByFolder(userId, persona, folderId) {
    return await Resource.find(
      PersonaDataService.buildPersonaQuery(userId, persona, { folderId })
    ).populate('tags', 'name color').sort({ createdAt: -1 });
  }

  static async getFavorites(userId, persona) {
    return await Resource.find(
      PersonaDataService.buildPersonaQuery(userId, persona, { isFavorite: true })
    ).populate('tags', 'name color').sort({ createdAt: -1 });
  }

  static async search(userId, persona, searchTerm) {
    return await Resource.find({
      ...PersonaDataService.buildPersonaQuery(userId, persona),
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { url: { $regex: searchTerm, $options: 'i' } }
      ]
    }).populate('tags', 'name color').sort({ createdAt: -1 });
  }

  static async getUnorganized(userId, persona) {
    return await Resource.find({
      ...PersonaDataService.buildPersonaQuery(userId, persona),
      $or: [
        // No description or empty description
        { description: { $exists: false } },
        { description: '' },
        // No tags
        { tags: { $size: 0 } },
        { tags: { $exists: false } }
      ]
    }).populate('tags', 'name color').sort({ createdAt: -1 });
  }

  static async moveToTrash(userId, persona, resourceId) {
    const resource = await Resource.findOneAndUpdate(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: resourceId }),
      { isTrashed: true },
      { new: true }
    );
    if (!resource) {
      throw new Error('Resource not found');
    }
    return resource;
  }

  static async restoreFromTrash(userId, persona, resourceId) {
    const resource = await Resource.findOneAndUpdate(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: resourceId }),
      { isTrashed: false },
      { new: true }
    );
    if (!resource) {
      throw new Error('Resource not found');
    }
    return resource;
  }
}

export default ResourceService;
