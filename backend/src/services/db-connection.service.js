const mongoose = require('mongoose');

module.exports.createDBConnection = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/shopshop', {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
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
