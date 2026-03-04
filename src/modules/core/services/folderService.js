import mongoose from 'mongoose';
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
        isDefault: true,
        isTrashed: false
      });
    }

    return defaultFolder;
  }

  static async create(userId, persona, folderData) {
    const sanitized = PersonaDataService.sanitizePersonaDocument(
      folderData,
      userId,
      persona
    );

    const folder = await Folder.create({
      ...sanitized,
      isTrashed: false,
      deletedAt: null
    });

    return folder;
  }

  static async getAll(userId, persona) {
    const query = PersonaDataService.buildPersonaQuery(userId, persona, {
      isTrashed: false
    });
    const folders = await Folder.find(query).sort({ isDefault: -1, createdAt: -1 });

    // Get resource counts for each folder
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        const resourceCount = await Resource.countDocuments({
          userId,
          persona,
          folderId: folder._id,
          isTrashed: false
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
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: folderId, isTrashed: false })
    );

    if (!folder) {
      throw new Error('Folder not found');
    }

    return folder;
  }

  static async update(userId, persona, folderId, updateData) {
    const folder = await Folder.findOneAndUpdate(
      PersonaDataService.buildPersonaQuery(userId, persona, { _id: folderId, isTrashed: false }),
      updateData,
      { new: true, runValidators: true }
    );

    if (!folder) {
      throw new Error('Folder not found');
    }

    return folder;
  }

  static async softDelete(userId, persona, folderId) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const folder = await Folder.findOne(
        PersonaDataService.buildPersonaQuery(userId, persona, { _id: folderId })
      ).session(session);

      if (!folder) throw new Error('Folder not found');
      if (folder.isDefault)
        throw new Error('Default folder cannot be deleted');

      const now = new Date();

      folder.isTrashed = true;
      folder.deletedAt = now;
      await folder.save({ session });

      // Only trash resources that aren't already trashed (preserve manually trashed items)
      await Resource.updateMany(
        { userId, persona, folderId, isTrashed: false },
        { 
          isTrashed: true, 
          trashedByFolder: true,
          deletedAt: now 
        },
        { session }
      );

      await session.commitTransaction();
      return folder;

    } catch (error) {
      await session.abortTransaction();
      throw error;

    } finally {
      session.endSession();
    }
  }

  static async restore(userId, persona, folderId) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const folder = await Folder.findOne(
        PersonaDataService.buildPersonaQuery(userId, persona, { _id: folderId })
      ).session(session);

      if (!folder) throw new Error('Folder not found');

      folder.isTrashed = false;
      folder.deletedAt = null;
      await folder.save({ session });

      // Only restore resources that were trashed due to folder deletion
      // Keep manually trashed resources in trash
      await Resource.updateMany(
        { userId, persona, folderId, trashedByFolder: true },
        { 
          isTrashed: false, 
          trashedByFolder: false,
          deletedAt: null 
        },
        { session }
      );

      await session.commitTransaction();
      return folder;

    } catch (error) {
      await session.abortTransaction();
      throw error;

    } finally {
      session.endSession();
    }
  }

  static async hardDelete(userId, persona, folderId) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const folder = await Folder.findOne(
        PersonaDataService.buildPersonaQuery(userId, persona, { _id: folderId })
      ).session(session);

      if (!folder) throw new Error('Folder not found');
      if (!folder.isTrashed)
        throw new Error('Folder must be trashed before permanent deletion');

      await Resource.deleteMany(
        { userId, persona, folderId },
        { session }
      );

      await Folder.deleteOne(
        { _id: folder._id },
        { session }
      );

      await session.commitTransaction();
      return true;

    } catch (error) {
      await session.abortTransaction();
      throw error;

    } finally {
      session.endSession();
    }
  }

  static async getTrash(userId, persona) {
    const folders = await Folder.find(
      PersonaDataService.buildPersonaQuery(userId, persona, {
        isTrashed: true
      })
    ).sort({ deletedAt: -1 });

    const resources = await Resource.find({
      userId,
      persona,
      isTrashed: true
    }).sort({ deletedAt: -1 });

    return { folders, resources };
  }

}

export default FolderService;
