const { PrismaClient } = require('@prisma/client');

let prisma;

// Robust fallback for Vercel serverless environments
// If DATABASE_URL is missing, we gracefully fall back to MONGO_URI
let connectionUrl = process.env.DATABASE_URL || process.env.MONGO_URI;

// FIX: If they only provided MONGO_URI in Vercel and it's missing the database name, 
// Prisma will throw "AtlasError: empty database name not allowed" (Error 8000).
// Mongoose allows empty DB names, but Prisma strictly requires it.
// FIX: Ensure database name is always 'pulsedesk' if not specified
if (connectionUrl && !connectionUrl.includes('.mongodb.net/pulsedesk')) {
  if (connectionUrl.includes('.mongodb.net/?')) {
    connectionUrl = connectionUrl.replace('.mongodb.net/?', '.mongodb.net/pulsedesk?');
  } else if (connectionUrl.includes('.mongodb.net/')) {
    const parts = connectionUrl.split('.mongodb.net/');
    if (parts[1].startsWith('?') || parts[1] === '') {
      connectionUrl = parts[0] + '.mongodb.net/pulsedesk' + parts[1];
    }
  }
}
console.log('Final Prisma Connection URL (obfuscated):', connectionUrl.replace(/:([^@]+)@/, ':****@'));

// We explicitly inject the url. This prevents Prisma from crashing with 
// "Environment variable not found: DATABASE_URL" if it tries to read schema.prisma natively.
const prismaConfig = connectionUrl ? {
  datasources: {
    db: {
      url: connectionUrl
    }
  }
} : {};

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(prismaConfig);
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient(prismaConfig);
  }
  prisma = global.prisma;
}

module.exports = prisma;
