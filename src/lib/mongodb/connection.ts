import mongoose from "mongoose";
import dns from "node:dns";

// Fix Windows DNS SRV lookup timeout (ETIMEOUT) on mongodb+srv:// URIs
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore in environments where setting DNS servers is not permitted
}

const RAW_URI = (process.env.MONGODB_URI || "").replace(/['"]/g, "").trim();
let MONGODB_URI = RAW_URI;
if (MONGODB_URI && !MONGODB_URI.includes("?")) {
  MONGODB_URI = MONGODB_URI.endsWith("/")
    ? `${MONGODB_URI}school_harmony?retryWrites=true&w=majority`
    : `${MONGODB_URI}/school_harmony?retryWrites=true&w=majority`;
}

if (!MONGODB_URI) {
  console.warn("⚠️ Warning: MONGODB_URI is not set in environment variables.");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is missing.");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
