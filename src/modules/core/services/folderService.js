import Folder from '../models/Folder.js';
import Resource from '../models/Resource.js';
import PersonaDataService from '../../shared/services/PersonaDataService.js';

class FolderService {
  /**
   * Get or create default "Uncategorized" folder for user/persona
   */
  static async getOrCreateDefaultFolder(userId, persona) {
    let defaultFolder = await Folder.findOne({
      userId,
      persona,
      name: 'Uncategorized'
    });

    if (!defaultFolder) {
      defaultFolder = await Folder.create({
        userId,
        persona,
        name: 'Uncategorized',
        description: 'Default folder for unorganized resources',
        color: '#6B7280',
        icon: '📂',
        isDefault: true
      });
    }

    return defaultFolder;
  }

  static async create(userId, persona, folderData) {
    const folder = await Folder.create(
      PersonaDataService.sanitizePersonaDocument(folderData, userId, persona)
    );
    return folder;
  }

  static async getAll(userId, persona) {
    const query = PersonaDataService.buildPersonaQuery(userId, persona);
    const folders = await Folder.find(query).sort({ isDefault: -1, createdAt: -1 });
    
    // Get resource counts for each folder
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        // Count only non-trashed resources for active folders
        // For trashed folders, count all resources (to show what will be affected)
        const resourceCountQuery = {
          userId,
          persona,
          folderId: folder._id
        };
        
        // If folder is not trashed, only count non-trashed resources
        if (!folder.isTrashed) {
          resourceCountQuery.isTrashed = { $ne: true };
        }
        
        const resourceCount = await Resource.countDocuments(resourceCountQuery);
        
        return {
          ...folder.toObject(),
          resourceCount
        };
      })
    );

    return foldersWithCounts;
  }

  static async getById(userId, persona, folderId) {
    const folder = await Folder.findOne(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: folderId })
    );
    
    if (!folder) {
      throw new Error('Folder not found');
    }
    
    return folder;
  }

  static async update(userId, persona, folderId, updateData) {
    const folder = await Folder.findOneAndUpdate(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: folderId }),
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!folder) {
      throw new Error('Folder not found');
    }
    
    return folder;
  }

  static async moveToTrash(userId, persona, folderId) {
    const folder = await Folder.findOneAndUpdate(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: folderId }),
      { 
        isTrashed: true,
        deletedAt: new Date()
      },
      { new: true }
    );
    
    if (!folder) {
      throw new Error('Folder not found');
    }
    
    // Bulk update all resources in this folder to be trashed
    await Resource.updateMany(
      { userId, persona, folderId },
      { 
        $set: { 
          isTrashed: true,
          deletedAt: new Date()
        } 
      }
    );
    
    return folder;
  }

  static async restoreFromTrash(userId, persona, folderId) {
    const folder = await Folder.findOneAndUpdate(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: folderId, isTrashed: true }),
      { 
        isTrashed: false,
        deletedAt: null
      },
      { new: true }
    );
    
    if (!folder) {
      throw new Error('Folder not found or not in trash');
    }
    
    // Restore all resources inside this folder that were trashed
    // We only restore resources that are currently trashed
    await Resource.updateMany(
      { userId, persona, folderId, isTrashed: true },
      { 
        $set: { 
          isTrashed: false,
          deletedAt: null
        } 
      }
    );
    
    return folder;
  }

  static async hardDelete(userId, persona, folderId) {
    // Hard delete can only be performed on trashed folders
    const folder = await Folder.findOne(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: folderId, isTrashed: true })
    );
    
    if (!folder) {
      throw new Error('Folder not found or not in trash. Hard delete only allowed for trashed folders.');
    }
    
    // Hard delete all resources in this folder permanently
    await Resource.deleteMany(
      { userId, persona, folderId }
    );
    
    // Hard delete the folder permanently
    await Folder.findOneAndDelete(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: folderId })
    );
    
    return { message: 'Folder and all contents permanently deleted' };
  }
}

export default FolderService;
