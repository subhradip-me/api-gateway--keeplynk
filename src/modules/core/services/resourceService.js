import Resource from '../models/Resource.js';
import Tag from '../models/Tag.js';
import Folder from '../models/Folder.js';
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
    // If no title provided (null/undefined/empty/"Untitled") and URL exists, fetch title from metadata
    if ((!resourceData.title || resourceData.title === 'Untitled') && resourceData.url && resourceData.type !== 'document') {
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
    if (!resourceData.title || resourceData.title === 'Untitled') {
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
    const baseQuery = PersonaDataService.buildPersonaQuery(userId, persona, filters);
    // Exclude trashed resources from normal listing
    const query = { ...baseQuery, isTrashed: { $ne: true } };

    const resources = await Resource.find(query)
      .populate('tags', 'name color')
      .populate('folderId', 'name color icon isTrashed')
      .sort({ createdAt: -1 });

    // Apply folder invariant: resource is effectively trashed if its parent folder is trashed
    return resources.map(resource => {
      const resourceObj = resource.toObject();
      const folderIsTrashed = resource.folderId?.isTrashed ?? false;
      resourceObj.effectivelyTrashed = resource.isTrashed || folderIsTrashed;
      return resourceObj;
    });
  }

  static async getTrash(userId, persona) {
    const query = PersonaDataService.buildPersonaQuery(userId, persona);
    const resources = await Resource.find({ ...query, isTrashed: true })
      .populate('tags', 'name color')
      .populate('folderId', 'name color icon isTrashed')
      .sort({ deletedAt: -1 });

    return resources.map(resource => {
      const resourceObj = resource.toObject();
      resourceObj.effectivelyTrashed = true;
      return resourceObj;
    });
  }

  static async getById(userId, persona, resourceId) {
    const resource = await Resource.findOne(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: resourceId })
    )
      .populate('tags', 'name color')
      .populate('folderId', 'name color icon isTrashed');
    
    if (!resource) {
      throw new Error('Resource not found');
    }
    
    const resourceObj = resource.toObject();
    const folderIsTrashed = resource.folderId?.isTrashed ?? false;
    resourceObj.effectivelyTrashed = resource.isTrashed || folderIsTrashed;
    return resourceObj;
  }

  static async moveToFolder(userId, persona, resourceId, targetFolderId) {
    // Validate the resource exists and belongs to this user/persona
    const resource = await Resource.findOne(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: resourceId })
    );

    if (!resource) {
      throw new Error('Resource not found');
    }

    // If moving to a specific folder (not root), validate the target folder
    if (targetFolderId) {
      const targetFolder = await Folder.findOne(
        PersonaDataService.buildPersonaQuery(userId, persona, { _id: targetFolderId })
      );

      if (!targetFolder) {
        throw new Error('Target folder not found or does not belong to this persona');
      }

      if (targetFolder.isTrashed) {
        throw new Error('Cannot move resource into a trashed folder');
      }
    }

    // Use $set explicitly so folderId: null works correctly
    const updated = await Resource.findOneAndUpdate(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: resourceId }),
      { $set: { folderId: targetFolderId ?? null } },
      { new: true }
    )
      .populate('tags', 'name color')
      .populate('folderId', 'name color icon isTrashed');

    const resourceObj = updated.toObject();
    resourceObj.effectivelyTrashed = updated.isTrashed || (updated.folderId?.isTrashed ?? false);
    return resourceObj;
  }

  static async update(userId, persona, resourceId, updateData) {
    // folderId changes must go through moveToFolder for proper validation
    if ('folderId' in updateData) {
      const { folderId, ...rest } = updateData;
      // If only folderId was being changed, delegate entirely to moveToFolder
      if (Object.keys(rest).length === 0) {
        return this.moveToFolder(userId, persona, resourceId, folderId);
      }
      // Otherwise move first, then apply the rest of the update below
      await this.moveToFolder(userId, persona, resourceId, folderId);
      updateData = rest;
    }

    // Handle tags: convert tag names to tag IDs if tags are being updated
    if (updateData.tags && Array.isArray(updateData.tags)) {
      const tagIds = await this.processTagNames(userId, persona, updateData.tags);
      updateData.tags = tagIds;
    }
    
    const resource = await Resource.findOneAndUpdate(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: resourceId }),
      updateData,
      { new: true, runValidators: true }
    )
      .populate('tags', 'name color')
      .populate('folderId', 'name color icon isTrashed');
    
    if (!resource) {
      throw new Error('Resource not found');
    }
    
    const resourceObj = resource.toObject();
    const folderIsTrashed = resource.folderId?.isTrashed ?? false;
    resourceObj.effectivelyTrashed = resource.isTrashed || folderIsTrashed;
    return resourceObj;
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
    const baseQuery = PersonaDataService.buildPersonaQuery(userId, persona, { folderId });
    return await Resource.find({ ...baseQuery, isTrashed: { $ne: true } })
      .populate('tags', 'name color')
      .populate('folderId', 'name color icon isTrashed')
      .sort({ createdAt: -1 });
  }

  static async getFavorites(userId, persona) {
    const baseQuery = PersonaDataService.buildPersonaQuery(userId, persona, { isFavorite: true });
    return await Resource.find({ ...baseQuery, isTrashed: { $ne: true } })
      .populate('tags', 'name color')
      .populate('folderId', 'name color icon isTrashed')
      .sort({ createdAt: -1 });
  }

  static async search(userId, persona, searchTerm) {
    return await Resource.find({
      ...PersonaDataService.buildPersonaQuery(userId, persona),
      isTrashed: { $ne: true },
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { url: { $regex: searchTerm, $options: 'i' } }
      ]
    })
      .populate('tags', 'name color')
      .populate('folderId', 'name color icon isTrashed')
      .sort({ createdAt: -1 });
  }

  static async getUnorganized(userId, persona) {
    return await Resource.find({
      ...PersonaDataService.buildPersonaQuery(userId, persona),
      isTrashed: { $ne: true },
      $or: [
        { description: { $exists: false } },
        { description: '' },
        { tags: { $size: 0 } },
        { tags: { $exists: false } }
      ]
    })
      .populate('tags', 'name color')
      .populate('folderId', 'name color icon isTrashed')
      .sort({ createdAt: -1 });
  }

  static async moveToTrash(userId, persona, resourceId) {
    const resource = await Resource.findOneAndUpdate(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: resourceId }),
      { 
        isTrashed: true,
        deletedAt: new Date()
      },
      { new: true }
    )
      .populate('tags', 'name color')
      .populate('folderId', 'name color icon isTrashed');
    if (!resource) {
      throw new Error('Resource not found');
    }
    return resource;
  }

  static async restoreFromTrash(userId, persona, resourceId) {
    const resource = await Resource.findOne(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: resourceId, isTrashed: true })
    );
    
    if (!resource) {
      throw new Error('Resource not found or not in trash');
    }
    
    // Check if the resource's folder is still trashed
    let targetFolderId = resource.folderId;
    
    if (resource.folderId) {
      const folder = await Folder.findOne({
        _id: resource.folderId,
        userId,
        persona
      });
      
      // If folder is trashed, move resource to root (folderId = null)
      // Option B: Move to root folder for cleaner architecture
      if (folder && folder.isTrashed) {
        targetFolderId = null;
      }
    }
    
    const updatedResource = await Resource.findOneAndUpdate(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: resourceId }),
      {
        $set: {
          isTrashed: false,
          deletedAt: null,
          folderId: targetFolderId ?? null
        }
      },
      { new: true }
    )
      .populate('tags', 'name color')
      .populate('folderId', 'name color icon isTrashed');

    return updatedResource;
  }

  static async hardDelete(userId, persona, resourceId) {
    // Hard delete can only be performed on trashed resources
    const resource = await Resource.findOne(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: resourceId, isTrashed: true })
    );
    
    if (!resource) {
      throw new Error('Resource not found or not in trash. Hard delete only allowed for trashed resources.');
    }
    
    // Hard delete the resource permanently
    await Resource.findOneAndDelete(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: resourceId })
    );
    
    return { message: 'Resource permanently deleted' };
  }
}

export default ResourceService;
