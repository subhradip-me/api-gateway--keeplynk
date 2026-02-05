
import axios from 'axios';
import Resource from '../../core/models/Resource.js';
import metadataService from './metadataService.js';

/**
 * Auto Organise Service
 * This is the BRAIN of the bulk AI workflow
 * 
 * Architecture:
 * 1. Find unorganised resources (controlled batch)
 * 2. Fetch metadata (cheap, fast)
 * 3. Call AI Engine (expensive, smart)
 * 4. Merge results safely (controlled)
 * 5. Save to database (Node decides, not AI)
 */
class OrganiseService {
  constructor() {
    // AI Engine URL (from environment or default)
    this.aiEngineUrl = process.env.AI_ENGINE_URL || 'http://localhost:8081';
    
    // Vibrant color palette for AI-assigned tags
    this.tagColors = [
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
  }

  /**
   * Intelligently assign a color to a tag based on its name
   * Uses hash of tag name to consistently assign same color to same tag across users
   */
  getColorForTag(tagName) {
    // Simple hash function for consistent color assignment
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
      hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.tagColors.length;
    return this.tagColors[index];
  }

  /**
   * Find unorganised resources for a user
   * CONTROLLED BATCH - limits cost and latency
   * 
   * @param {string} userId - User ID
   * @param {string} persona - User persona
   * @param {number} limit - Max resources to process (default: 50)
   * @returns {Promise<Array>} Array of resources
   */
  async findUnorganisedResources(userId, persona, limit = 50) {
    try {
      const query = {
        userId,
        persona,
        type: { $in: ['url', 'document'] }, // Process both URLs and documents
        $or: [
          // No description or empty description
          { description: { $exists: false } },
          { description: null },
          { description: '' },
          // No tags or empty tags array
          { tags: { $exists: false } },
          { tags: null },
          { tags: [] },
          { tags: { $size: 0 } }
        ]
      };
      
      console.log('[Auto-Organise] Query:', JSON.stringify(query, null, 2));
      
      const resources = await Resource.find(query)
        .limit(limit)
        .lean(); // Use lean for better performance
      
      console.log(`[Auto-Organise] Found ${resources.length} unorganised resources`);
      console.log('[Auto-Organise] Resources:', resources.map(r => ({ 
        id: r._id, 
        type: r.type, 
        title: r.title,
        hasDescription: !!r.description,
        tagsLength: r.tags?.length || 0
      })));
      
      return resources;
    } catch (error) {
      console.error('Error finding unorganised resources:', error);
      throw error;
    }
  }

  /**
   * Call AI Engine to enrich a resource
   * This is the EXPENSIVE operation
   * 
   * @param {Object} resource - Resource document
   * @param {Object} meta - Metadata fetched from URL
   * @param {Object} needs - What AI should do
   * @returns {Promise<Object>} AI response
   */
  async callAiEngine(resource, meta, needs) {
    try {
      const payload = {
        resourceId: resource._id.toString(),
        url: resource.url || null,
        type: resource.type || 'url',
        existingTitle: meta.title || resource.title || resource.name,
        existingDescription: meta.description,
        needs: needs,
        userId: resource.userId.toString(),
        persona: resource.persona || 'developer'
      };

      console.log(`[AI Engine] Calling with payload:`, JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${this.aiEngineUrl}/agent/resource/enrich`,
        payload,
        {
          timeout: 30000, // 30 seconds timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[AI Engine] Success response:`, response.status);
      return response.data;
    } catch (error) {
      console.error(`[AI Engine] Failed for resource ${resource._id}:`, error.message);
      if (error.code === 'ECONNREFUSED') {
        console.error(`[AI Engine] Cannot connect to AI Engine at ${this.aiEngineUrl}`);
        console.error('[AI Engine] Make sure the AI Engine is running on port 8081');
      }
      throw error;
    }
  }

  /**
   * Apply AI results to resource safely
   * This is where CONTROL lives - Node decides what to save
   * 
   * @param {Object} resource - Resource document
   * @param {Object} meta - Metadata from URL
   * @param {Object} aiResponse - AI Engine response
   * @returns {Promise<Object|null>} Updates to apply or null if no updates
   */
  async applyAiResult(resource, meta, aiResponse) {
    try {
      const { memory } = aiResponse;

      console.log(`[ApplyAiResult] Memory object:`, memory);

      // Check if AI Engine returned empty results (fallback mode or error)
      const hasAiData = memory && (memory.description || memory.tags || memory.suggestedTitle);
      const isLowConfidence = memory && memory.confidence && memory.confidence < 0.7;

      if (isLowConfidence) {
        console.log(`[ApplyAiResult] Low confidence (${memory.confidence}) for resource ${resource._id}`);
        return null;
      }

      // If AI Engine returned empty, generate fallback suggestions for documents
      if (!hasAiData && resource.type === 'document') {
        console.log(`[ApplyAiResult] AI returned empty, using fallback for document`);
        return this.generateFallbackUpdates(resource, meta);
      }

      if (!hasAiData) {
        console.log(`[ApplyAiResult] No AI data returned for resource ${resource._id}`);
        return null;
      }

      // Merge metadata and AI suggestions (metadata wins)
      const updates = {};

      // Title: prefer existing, then metadata, fallback to AI
      if (!resource.title || resource.title.trim() === '') {
        if (meta.title) {
          updates.title = meta.title;
        } else if (memory.suggestedTitle) {
          updates.title = memory.suggestedTitle;
        }
      }

      // Description: prefer existing, then metadata, fallback to AI
      if (!resource.description || resource.description.trim() === '') {
        if (meta.description) {
          updates.description = meta.description;
        } else if (memory.description) {
          updates.description = memory.description;
        }
      }

      // Tags: process AI-generated tags (handle both array and string formats)
      if (memory.tags && (!resource.tags || resource.tags.length === 0)) {
        const tagsArray = Array.isArray(memory.tags) 
          ? memory.tags 
          : memory.tags.split(',');
        
        const tagNames = tagsArray
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
        
        if (tagNames.length > 0) {
          updates.tagNames = tagNames; // Store tag names temporarily for processing
        }
      }

      // Folder/Category: Create folder if category exists and resource is in "Uncategorised"
      if (memory.category && memory.category.trim() !== '') {
        const Folder = (await import('../../core/models/Folder.js')).default;
        
        // Check if resource is in "Uncategorised" folder or has no folder
        let shouldCreateFolder = !resource.folderId;
        
        if (resource.folderId) {
          const currentFolder = await Folder.findById(resource.folderId);
          if (currentFolder && (currentFolder.name === 'Uncategorised' || currentFolder.name === 'Uncategorized')) {
            shouldCreateFolder = true;
          }
        }
        
        if (shouldCreateFolder) {
          // Check if folder with this category name already exists
          let folder = await Folder.findOne({
            userId: resource.userId,
            persona: resource.persona,
            name: memory.category.trim()
          });
          
          if (!folder) {
            // Create new folder with AI-suggested category
            const folderColor = this.getColorForTag(memory.category); // Reuse color logic
            folder = await Folder.create({
              userId: resource.userId,
              persona: resource.persona,
              name: memory.category.trim(),
              description: `AI-organized folder for ${memory.category}`,
              color: folderColor,
              icon: 'folder',
              isDefault: false
            });
            console.log(`[ApplyAiResult] Created new folder "${memory.category}" with color ${folderColor}`);
          }
          
          updates.folderId = folder._id;
          updates.categoryName = memory.category.trim(); // Store for logging
        }
      }

      console.log(`[ApplyAiResult] Generated updates:`, updates);

      // Return updates if we have any
      return Object.keys(updates).length > 0 ? updates : null;
    } catch (error) {
      console.error('[ApplyAiResult] Error:', error);
      return null;
    }
  }

  /**
   * Generate fallback updates when AI Engine returns empty
   * Used for documents when AI Engine is unavailable or returns no data
   */
  generateFallbackUpdates(resource, meta) {
    const updates = {};
    
    // Generate basic description from title
    if (!resource.description || resource.description.trim() === '') {
      const title = resource.title || meta.title || 'Untitled';
      updates.description = `Document: ${title}`;
    }

    // Generate basic tags from title keywords
    if (!resource.tags || resource.tags.length === 0) {
      const title = (resource.title || meta.title || '').toLowerCase();
      const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'document'];
      
      // Extract meaningful words from title
      const words = title
        .replace(/[^\w\s]/g, ' ') // Remove special characters
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word))
        .slice(0, 3); // Max 3 tags
      
      if (words.length > 0) {
        updates.tagNames = words;
      } else {
        // If no meaningful words, create generic tags
        updates.tagNames = ['document'];
      }
    }

    console.log(`[FallbackUpdates] Generated:`, updates);
    return Object.keys(updates).length > 0 ? updates : null;
  }

  /**
   * Process a single resource through the pipeline
   * 
   * @param {Object} resource - Resource document
   * @returns {Promise<{success: boolean, resourceId: string, error?: string}>}
   */
  async processResource(resource) {
    const resourceId = resource._id.toString();

    try {
      console.log(`[ProcessResource] Starting ${resource.type} - ${resource.title || resourceId}`);
      
      // STEP 1: Fetch metadata (cheap) - only for URLs
      let meta = { title: null, description: null };
      
      if (resource.url && resource.url.trim() !== '') {
        console.log(`[ProcessResource] Fetching metadata for URL: ${resource.url}`);
        meta = await metadataService.fetchMetadata(resource.url);
      } else if (resource.type === 'document') {
        // For documents without URL, use existing title/filename as metadata
        meta.title = resource.title || resource.name || null;
        console.log(`[ProcessResource] Document without URL, using title: ${meta.title}`);
      }

      console.log(`[ProcessResource] Metadata:`, meta);

      // STEP 2: Decide what AI should do (smart)
      const needs = metadataService.decideAiNeeds(resource, meta);
      console.log(`[ProcessResource] AI needs:`, needs);

      // Skip if nothing needed (metadata provided everything)
      if (!needs.title && !needs.description && !needs.tags) {
        console.log(`Resource ${resourceId} already has good metadata, skipping AI`);
        
        // Still update with metadata if we got some
        if (meta.title || meta.description) {
          const updates = {};
          if (meta.title && !resource.title) updates.title = meta.title;
          if (meta.description && !resource.description) updates.description = meta.description;
          
          if (Object.keys(updates).length > 0) {
            await Resource.updateOne(
              { _id: resource._id },
              { $set: updates }
            );
            
            return {
              success: true,
              resourceId,
              message: 'Updated with metadata only'
            };
          }
        }
        
        return {
          success: false,
          resourceId,
          error: 'Already organized'
        };
      }

      // STEP 3: Call AI Engine (expensive, but controlled)
      console.log(`[ProcessResource] Calling AI Engine...`);
      const aiResponse = await this.callAiEngine(resource, meta, needs);
      console.log(`[ProcessResource] AI Response:`, JSON.stringify(aiResponse, null, 2));

      // STEP 4: Apply results safely (Node decides)
      console.log(`[ProcessResource] Applying AI results...`);
      const updates = await this.applyAiResult(resource, meta, aiResponse);
      console.log(`[ProcessResource] Updates to apply:`, updates);

      if (updates) {
        // Process tags: convert tag names to tag IDs
        if (updates.tagNames) {
          const Tag = (await import('../../core/models/Tag.js')).default;
          const tagIds = [];
          
          for (const tagName of updates.tagNames) {
            // Find existing tag or create new one
            let tag = await Tag.findOne({
              userId: resource.userId,
              persona: resource.persona,
              name: tagName
            });
            
            if (!tag) {
              // Create new tag with AI-assigned color based on tag name
              const color = this.getColorForTag(tagName);
              tag = await Tag.create({
                userId: resource.userId,
                persona: resource.persona,
                name: tagName,
                color: color
              });
              console.log(`[ProcessResource] Created new tag "${tagName}" with color ${color}`);
            }
            
            tagIds.push(tag._id);
          }
          
          updates.tags = tagIds;
          delete updates.tagNames;
        }

        // Clean up temporary fields before saving
        if (updates.categoryName) {
          console.log(`[ProcessResource] Assigned to folder: ${updates.categoryName}`);
          delete updates.categoryName; // Don't save this to resource
        }

        // STEP 5: Save to database
        await Resource.updateOne(
          { _id: resource._id },
          { $set: updates }
        );

        return {
          success: true,
          resourceId,
          updates: Object.keys(updates)
        };
      } else {
        return {
          success: false,
          resourceId,
          error: 'Low confidence or no updates needed'
        };
      }
    } catch (error) {
      console.error(`Failed to process resource ${resourceId}:`, error.message);
      return {
        success: false,
        resourceId,
        error: error.message
      };
    }
  }

  /**
   * Main bulk processing function
   * This is the PIPELINE that orchestrates everything
   * 
   * @param {string} userId - User ID
   * @param {string} persona - User persona
   * @param {number} limit - Max resources to process
   * @returns {Promise<{total: number, success: number, failed: number, results: Array}>}
   */
  async organiseResourcesInBulk(userId, persona, limit = 50) {
    console.log(`[Auto-Organise] Starting for user ${userId}, persona ${persona}...`);

    try {
      // Find candidates
      const resources = await this.findUnorganisedResources(userId, persona, limit);

      if (resources.length === 0) {
        console.log('[Auto-Organise] No unorganised resources found');
        return {
          total: 0,
          success: 0,
          failed: 0,
          message: 'No unorganised resources found'
        };
      }

      console.log(`[Auto-Organise] Found ${resources.length} resources to process`);

      // Process each resource (sequential for now, can be parallelized later)
      const results = [];
      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < resources.length; i++) {
        const resource = resources[i];
        console.log(`[Auto-Organise] Processing ${i + 1}/${resources.length}: ${resource.title}`);
        
        const result = await this.processResource(resource);
        results.push(result);

        if (result.success) {
          successCount++;
        } else {
          failedCount++;
        }
      }

      console.log(`[Auto-Organise] Completed: ${successCount} success, ${failedCount} failed`);

      return {
        total: resources.length,
        success: successCount,
        failed: failedCount,
        results
      };
    } catch (error) {
      console.error('[Auto-Organise] Error in bulk organise:', error);
      throw error;
    }
  }

  /**
   * Extract metadata from URL for form auto-fill
   * Used by AddResource modal
   * 
   * @param {string} url - URL to extract metadata from
   * @param {string} persona - User persona for context
   * @param {string} userId - User ID for personalized memory
   * @returns {Promise<Object>} Extracted metadata
   */
  async extractUrlMetadata(url, persona, userId) {
    try {
      console.log(`[ExtractUrlMetadata] Starting for URL: ${url}`);

      // STEP 1: Try to fetch HTML metadata (optional, for title fallback)
      let meta = { title: null, description: null };
      try {
        meta = await metadataService.fetchMetadata(url);
        console.log(`[ExtractUrlMetadata] HTML metadata:`, meta);
      } catch (metaError) {
        console.warn(`[ExtractUrlMetadata] Metadata fetch failed (will use AI only):`, metaError.message);
      }

      // STEP 2: Call AI Engine for intelligent extraction (description + tags)
      // This is the PRIMARY source, metadata is just fallback
      console.log(`[ExtractUrlMetadata] Calling AI Engine at ${this.aiEngineUrl}/agent/resource/enrich`);
      
      // Simple payload - let AI Engine decide everything (like Auto Organise)
      const aiPayload = {
        resourceId: 'temp-form-fill',
        url: url,
        persona: persona || 'student',
        userId: userId
      };
      
      console.log(`[ExtractUrlMetadata] AI Engine payload:`, JSON.stringify(aiPayload, null, 2));
      
      const aiResponse = await axios.post(
        `${this.aiEngineUrl}/agent/resource/enrich`,
        aiPayload,
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[ExtractUrlMetadata] AI Engine response:`, JSON.stringify(aiResponse.data, null, 2));
      
      const { memory } = aiResponse.data;

      // Return AI-generated content with HTML metadata as fallback
      const result = {
        title: meta.title || memory?.suggestedTitle || null, // Prefer HTML title, fallback to AI
        description: memory?.description || meta.description || null, // Prioritize AI description
        tags: [],
        category: memory?.category || null
      };

      // Parse AI-generated tags (handle both array and string formats)
      if (memory?.tags) {
        const tagsArray = Array.isArray(memory.tags) 
          ? memory.tags 
          : memory.tags.split(',');
        
        result.tags = tagsArray
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)
          .slice(0, 5); // Limit to 5 tags
      }

      console.log(`[ExtractUrlMetadata] Final result:`, result);
      return result;
    } catch (error) {
      console.error('[ExtractUrlMetadata] Error:', error);
      throw error;
    }
  }

  /**
   * Extract metadata from document for form auto-fill
   * Used by AddResource modal
   * 
   * @param {Object} file - Multer file object
   * @param {string} persona - User persona for context
   * @param {string} userId - User ID for personalized memory
   * @returns {Promise<Object>} Extracted metadata
   */
  async extractDocumentMetadata(file, persona, userId) {
    try {
      console.log(`[ExtractDocumentMetadata] Starting for file: ${file.originalname}`);

      // Extract basic info from filename
      const filename = file.originalname;
      const filenameWithoutExt = filename.replace(/\.[^/.]+$/, '');
      const fileExtension = filename.split('.').pop().toLowerCase();

      // STEP 1: Try AI Engine for intelligent extraction
      try {
        // Send file to AI Engine for analysis
        const FormData = (await import('form-data')).default;
        const formData = new FormData();
        formData.append('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype
        });
        formData.append('persona', persona || 'student');
        formData.append('type', 'document');
        formData.append('userId', userId);

        const aiResponse = await axios.post(
          `${this.aiEngineUrl}/agent/document/analyze`,
          formData,
          {
            timeout: 30000,
            headers: formData.getHeaders()
          }
        );

        const { memory } = aiResponse.data;

        // Return AI-generated content only (no title override)
        const result = {
          description: memory?.description || `${fileExtension.toUpperCase()} document`,
          tags: [],
          category: memory?.category || null
        };

        if (memory?.tags) {
          const tagsArray = Array.isArray(memory.tags) 
            ? memory.tags 
            : memory.tags.split(',');
          
          result.tags = tagsArray
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
            .slice(0, 5);
        }

        console.log(`[ExtractDocumentMetadata] AI result:`, result);
        return result;
      } catch (aiError) {
        console.error('[ExtractDocumentMetadata] AI Engine failed, using fallback:', aiError.message);
        
        // Fallback: Generate basic metadata from filename
        const result = {
          description: `${fileExtension.toUpperCase()} document`,
          tags: [],
          category: null
        };

        // Extract tags from filename
        const words = filenameWithoutExt
          .replace(/[-_]/g, ' ')
          .replace(/([A-Z])/g, ' $1')
          .toLowerCase()
          .split(/\s+/)
          .filter(word => word.length > 2 && word.length < 20)
          .slice(0, 5);
        
        result.tags = words;

        // Basic category based on file extension
        const categoryMap = {
          'pdf': 'documents',
          'doc': 'documents',
          'docx': 'documents',
          'txt': 'documents',
          'xls': 'spreadsheets',
          'xlsx': 'spreadsheets',
          'ppt': 'presentations',
          'pptx': 'presentations',
          'jpg': 'images',
          'jpeg': 'images',
          'png': 'images',
          'gif': 'images'
        };
        result.category = categoryMap[fileExtension] || 'documents';

        console.log(`[ExtractDocumentMetadata] Fallback result:`, result);
        return result;
      }
    } catch (error) {
      console.error('[ExtractDocumentMetadata] Error:', error);
      throw error;
    }
  }
}

export default new OrganiseService();
