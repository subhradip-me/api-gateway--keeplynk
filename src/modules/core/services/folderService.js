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
        const resourceCount = await Resource.countDocuments({
          userId,
          persona,
          folderId: folder._id
        });
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

  static async delete(userId, persona, folderId) {
    const folder = await Folder.findOneAndDelete(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: folderId })
    );
    
    if (!folder) {
      throw new Error('Folder not found');
    }
    
    // Move all resources from deleted folder to default folder
    const defaultFolder = await this.getOrCreateDefaultFolder(userId, persona);
    await Resource.updateMany(
      { userId, persona, folderId },
      { $set: { folderId: defaultFolder._id } }
    );
    
    return folder;
  }
}

export default FolderService;
