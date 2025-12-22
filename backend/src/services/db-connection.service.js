const mongoose = require('mongoose');

/**
 * Encodes special characters in MongoDB connection string password
 * @param {string} connectionString - The MongoDB connection string
 * @returns {string} - Connection string with encoded password
 */
function encodeConnectionString(connectionString) {
  // Pattern to match: mongodb:// or mongodb+srv:// followed by username:password@host/db
  // This regex captures: protocol, username, password, and the rest (host/db/options)
  const match = connectionString.match(/^(mongodb\+srv:\/\/|mongodb:\/\/)([^:]+):([^@]+)@(.+)$/);
  
  if (match) {
    const [, protocol, username, password, rest] = match;
    // URL encode the password to handle special characters like @, :, /, #, %, etc.
    const encodedPassword = encodeURIComponent(password);
    return `${protocol}${username}:${encodedPassword}@${rest}`;
  }
  
  // If pattern doesn't match, return as-is (might be connection string without password)
  return connectionString;
}

module.exports.createDBConnection = async () => {
  try {
    // Get the database URL from environment variables
    let connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // If DATABASE_URL doesn't start with mongodb:// or mongodb+srv://, prepend mongodb+srv://
    if (!connectionString.startsWith('mongodb://') && !connectionString.startsWith('mongodb+srv://')) {
      connectionString = `mongodb+srv://${connectionString}`;
    }

    // Encode special characters in password
    connectionString = encodeConnectionString(connectionString);

    await mongoose.connect(connectionString, {
      // useNewUrlParser: true, // No longer needed in Mongoose 6+
      // useUnifiedTopology: true, // No longer needed in Mongoose 6+
    });

    console.log('✅ Connected to MongoDB');

    mongoose.connection.on('error', (err) =>
      console.error('❌ MongoDB connection error:', err)
    );

    mongoose.connection.on('disconnected', () =>
      console.warn('⚠️ MongoDB disconnected')
    );
  } catch (error) {
    console.error('❌ Initial MongoDB connection failed:', error);
  }
};
