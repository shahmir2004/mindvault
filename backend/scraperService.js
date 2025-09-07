// mindvault/backend/scraperService.js

const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

/**
 * Extracts the main article content from a raw HTML string.
 * @param {string} html The raw HTML content of the webpage.
 * @param {string} url The original URL of the webpage, used by Readability to resolve relative links.
 * @returns {object|null} An object containing the clean title, content, textContent, etc., or null if extraction fails.
 */
function extractArticle(html, url) {
  try {
    // Create a virtual DOM from the raw HTML.
    // The URL is provided as an option to help Readability resolve relative image/link paths.
    const doc = new JSDOM(html, {
      url: url,
    });

    // Create a new Readability instance and parse the document.
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    // The 'article' object now contains the clean, extracted content.
    // We are most interested in:
    // - title: The clean title of the article.
    // - content: The clean HTML of the article.
    // - textContent: The plain text version of the article content.
    // - excerpt: A short summary of the article.
    
    if (article && article.textContent) {
      return article;
    } else {
      // If Readability fails, we can fall back to a basic extraction.
      console.log(`Readability failed for ${url}. Falling back to basic extraction.`);
      const title = doc.window.document.title || 'Untitled';
      const bodyText = doc.window.document.body.textContent.replace(/\s\s+/g, ' ').trim();
      return {
        title: title,
        content: doc.window.document.body.innerHTML, // Keep the HTML content
        textContent: bodyText,
        excerpt: bodyText.substring(0, 200),
      };
    }
  } catch (error) {
    console.error(`Error extracting article from ${url}:`, error);
    return null; // Return null if any errors occur
  }
}

// Export the function so it can be used in other files.
module.exports = {
  extractArticle,
};