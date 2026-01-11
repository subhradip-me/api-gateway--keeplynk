import Resource from '../../../core/models/Resource.js';
import Folder from '../../../core/models/Folder.js';
import Tag from '../../../core/models/Tag.js';

class GenaralService {
  static async getDashboard(userId) {
    const [recentResources, folders, tags, counts] = await Promise.all([
      Resource.find({ userId, persona: 'genaral' }).sort({ createdAt: -1 }).limit(12),
      Folder.find({ userId, persona: 'genaral' }).sort({ name: 1 }).limit(10),
      Tag.find({ userId, persona: 'genaral' }).sort({ usageCount: -1 }).limit(10),
      this.getCounts(userId)
    ]);

    return {
      recentResources,
      folders,
      tags,
      stats: counts
    };
  }

  static async getCounts(userId) {
    const [totalResources, favoriteResources, totalFolders, totalTags] = await Promise.all([
      Resource.countDocuments({ userId, persona: 'genaral' }),
      Resource.countDocuments({ userId, persona: 'genaral', isFavorite: true }),
      Folder.countDocuments({ userId, persona: 'genaral' }),
      Tag.countDocuments({ userId, persona: 'genaral' })
    ]);

    return {
      totalResources,
      favoriteResources,
      totalFolders,
      totalTags
    };
  }
}

export default GenaralService;
