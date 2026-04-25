const { PrismaClient } = require('@prisma/client');

let prisma;

// Robust fallback for Vercel serverless environments
// If DATABASE_URL is missing, we gracefully fall back to MONGO_URI
const connectionUrl = process.env.DATABASE_URL || process.env.MONGO_URI;

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
