import organiseService from '../services/organiseService.js';

/**
 * Auto Organise Controller
 * Handles HTTP requests for the Auto Organise feature
 */
class OrganiseController {
  /**
   * POST /api/organise/auto
   * Start auto-organise for user's resources
   * 
   * This endpoint returns immediately (fire & forget pattern)
   * The actual processing happens asynchronously
   */
  async autoOrganise(req, res) {
    try {
      const userId = req.personaContext.userId;
      const persona = req.personaContext.persona;
      const limit = parseInt(req.query.limit) || 50;

      // Validate limit
      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          message: 'Limit must be between 1 and 100'
        });
      }

      // Start processing asynchronously (fire & forget)
      // User doesn't wait for AI calls
      organiseService.organiseResourcesInBulk(userId, persona, limit)
        .then(result => {
          console.log('Auto-organise completed:', result);
        })
        .catch(error => {
          console.error('Auto-organise failed:', error);
        });

      // Return immediately
      res.json({
        success: true,
        status: 'started',
        message: 'Auto organise in progress. Your resources are being organized.',
        limit
      });
    } catch (error) {
      console.error('Error starting auto-organise:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start auto-organise',
        error: error.message
      });
    }
  }

  /**
   * GET /api/organise/preview
   * Preview how many resources will be organized
   * (Optional feature for better UX)
   */
  async preview(req, res) {
    try {
      const userId = req.personaContext.userId;
      const persona = req.personaContext.persona;
      const limit = parseInt(req.query.limit) || 50;

      console.log('[Preview] Request received:', { userId, persona, limit });

      const resources = await organiseService.findUnorganisedResources(userId, persona, limit);

      console.log(`[Preview] Responding with ${resources.length} resources`);

      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      res.json({
        success: true,
        count: resources.length,
        message: `Found ${resources.length} unorganised resources`
      });
    } catch (error) {
      console.error('Error getting preview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get preview',
        error: error.message
      });
    }
  }

  /**
   * POST /api/organise/extract-metadata
   * Extract metadata from URL using AI
   * Used for auto-filling AddResource form
   */
  async extractMetadata(req, res) {
    try {
      const { url } = req.body;
      const persona = req.personaContext.persona;
      const userId = req.personaContext.userId;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL is required'
        });
      }

      console.log('[ExtractMetadata] Processing URL:', url);

      const metadata = await organiseService.extractUrlMetadata(url, persona, userId);

      res.json({
        success: true,
        data: metadata
      });
    } catch (error) {
      console.error('Error extracting metadata:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to extract metadata',
        error: error.message
      });
    }
  }

  /**
   * POST /api/organise/extract-document-metadata
   * Extract metadata from uploaded document using AI
   * Used for auto-filling AddResource form
   */
  async extractDocumentMetadata(req, res) {
    try {
      const file = req.file;
      const persona = req.personaContext.persona;
      const userId = req.personaContext.userId;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'File is required'
        });
      }

      console.log('[ExtractDocumentMetadata] Processing file:', file.originalname);

      const metadata = await organiseService.extractDocumentMetadata(file, persona, userId);

      res.json({
        success: true,
        data: metadata
      });
    } catch (error) {
      console.error('Error extracting document metadata:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to extract document metadata',
        error: error.message
      });
    }
  }
}

export default new OrganiseController();
