function extractPublicIdFromUrl(url) {
  try {
    // Extract the path from the URL and remove the file extension
    const path = url.split('/').slice(-2).join('/'); // Get last two parts
    const publicId = path.split('.')[0]; // Remove file extension
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}

module.exports = extractPublicIdFromUrl;
