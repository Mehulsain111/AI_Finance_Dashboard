import mongoose from "mongoose";
import dns from "node:dns/promises";

// mongodb+srv:// connection strings resolve the cluster's real hosts via a
// DNS SRV record lookup before ever contacting MongoDB. On some networks --
// and as a known, currently-being-fixed Node.js regression on Windows --
// that specific lookup gets refused (querySrv ECONNREFUSED) even though
// normal internet access is fine. Pointing Node at a public DNS resolver
// directly sidesteps whatever the OS/network is doing wrong here, without
// needing to change your connection string or your system's network
// settings.
try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch {
  // Non-fatal -- if this fails for any reason, connection attempts still
  // fall back to whatever resolver was configured before.
}

const MONGODB_URI = process.env.MONGODB_URI;

// Next.js reloads modules on every request in dev mode, which would open a
// fresh connection each time without this. Stashing the promise on `global`
// survives those reloads; mongoose.connect() is a safe no-op if already
// connected, so this also works fine as-is in production.
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

export default async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable in .env.local");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
