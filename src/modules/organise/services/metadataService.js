import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Fetches metadata from a URL (Open Graph, meta tags)
 * This is the CHEAP operation that runs before AI
 */
class MetadataService {
  /**
   * Fetch metadata from URL
   * @param {string} url - The URL to fetch metadata from
   * @returns {Promise<{title: string|null, description: string|null, image: string|null}>}
   */
  async fetchMetadata(url) {
    try {
      // Validate URL first
      try {
        new URL(url);
      } catch (e) {
        console.error(`Invalid URL: ${url}`);
        return { title: null, description: null, image: null };
      }

      // Check if this is a video URL - let AI Engine's TranscriptSkill handle video content
      const isVideoUrl = this.isVideoUrl(url);
      if (isVideoUrl) {
        console.log(`[MetadataService] Video URL detected: ${url}, skipping content extraction`);
        return {
          title: null,
          description: null,
          image: null,
          content: null // Let TranscriptSkill handle video content
        };
      }

      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400 // Accept redirects
      });

      const $ = cheerio.load(response.data);

      // Extract Open Graph metadata (preferred)
      const ogTitle = $('meta[property="og:title"]').attr('content');
      const ogDescription = $('meta[property="og:description"]').attr('content');
      const ogImage = $('meta[property="og:image"]').attr('content');

      // Fallback to standard meta tags
      const metaDescription = $('meta[name="description"]').attr('content');
      const pageTitle = $('title').text().trim();

      // Extract page content for AI analysis
      // Remove script, style, nav, footer, and other non-content elements
      $('script, style, nav, footer, header, aside, iframe, noscript').remove();
      
      // Get main content (prioritize article, main, or body)
      let contentText = '';
      const mainContent = $('article, main, [role="main"]');
      if (mainContent.length > 0) {
        contentText = mainContent.text();
      } else {
        contentText = $('body').text();
      }
      
      // Clean and limit content (first 2000 characters for AI analysis)
      contentText = contentText
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .trim()
        .substring(0, 2000);  // Limit length for AI processing

      return {
        title: ogTitle?.trim() || pageTitle || null,
        description: ogDescription?.trim() || metaDescription?.trim() || null,
        image: ogImage || null,
        content: contentText || null  // Add content for AI analysis
      };
    } catch (error) {
      console.error(`Failed to fetch metadata for ${url}:`, error.message);
      return {
        title: null,
        description: null,
        image: null
      };
    }
  }

  /**
   * Decide what AI needs to do based on existing metadata
   * This is the SMART FILTER that saves AI cost
   * @param {Object} resource - The resource document
   * @param {Object} meta - Fetched metadata
   * @returns {{title: boolean, description: boolean, tags: boolean, category: boolean}}
   */
  decideAiNeeds(resource, meta) {
    return {
      // Only ask AI for title if metadata didn't give us a good one
      title: !meta.title || meta.title.length < 5,
      
      // Always ask AI for description (AI generates better descriptions)
      description: true,
      
      // Always ask AI for tags (this is what AI is good at)
      tags: true,
      
      // Always ask AI for category/folder (for smart organization)
      category: true
    };
  }

  /**
   * Check if URL is a video platform URL
   * @param {string} url - URL to check
   * @returns {boolean} True if it's a video URL
   */
  isVideoUrl(url) {
    const videoPatterns = [
      /youtube\.com\/watch/i,
      /youtu\.be\//i,
      /vimeo\.com\/\d+/i,
      /dailymotion\.com\/video/i,
      /twitch\.tv\/videos/i,
      /facebook\.com\/.+\/videos/i,
      /instagram\.com\/p\/.+/i,
      /tiktok\.com\/.+\/video/i,
      /twitter\.com\/.+\/status/i,
      /x\.com\/.+\/status/i
    ];
    
    return videoPatterns.some(pattern => pattern.test(url));
  }
}

export default new MetadataService();
