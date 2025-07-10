// Import PrismaClient directly using require for compatibility
const { PrismaClient } = require('@prisma/client');

// Define the global type
const globalForPrisma = global as unknown as { prisma: any };

// Create or reuse the Prisma instance
export const prisma = 
  globalForPrisma.prisma || 
  new PrismaClient();

// Save the instance to avoid multiple instances in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
