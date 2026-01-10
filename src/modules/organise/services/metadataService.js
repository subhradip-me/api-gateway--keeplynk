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

      return {
        title: ogTitle?.trim() || pageTitle || null,
        description: ogDescription?.trim() || metaDescription?.trim() || null,
        image: ogImage || null
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
   * @returns {{title: boolean, description: boolean, tags: boolean}}
   */
  decideAiNeeds(resource, meta) {
    return {
      // Only ask AI for title if metadata didn't give us a good one
      title: !meta.title || meta.title.length < 5,
      
      // Only ask AI for description if metadata didn't provide one
      description: !meta.description,
      
      // Always ask AI for tags (this is what AI is good at)
      tags: true
    };
  }
}

export default new MetadataService();
