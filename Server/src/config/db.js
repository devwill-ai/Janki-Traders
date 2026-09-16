import mongoose from 'mongoose';
import dns from 'dns';

export const connectDB = async () => {
  try {
    // In development mode, use Google DNS servers to prevent querySrv ECONNREFUSED errors from local ISP/router DNS
    if (process.env.NODE_ENV !== 'production') {
      try {
        dns.setServers(['8.8.8.8', '8.8.4.4']);
      } catch (err) {
        console.warn('[Database] Could not override DNS servers in development:', err.message);
      }
    }

    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/janki_traders';
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    process.exit(1);
  }
};


