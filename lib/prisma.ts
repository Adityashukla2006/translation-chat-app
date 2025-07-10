// Import PrismaClient using proper TypeScript import
import * as prismaClient from '@prisma/client';
const { PrismaClient } = prismaClient;

// Define a proper type for the global Prisma instance
type PrismaInstanceType = InstanceType<typeof PrismaClient>;
const globalForPrisma = global as unknown as { prisma: PrismaInstanceType };

// Create or reuse the Prisma instance
export const prisma = 
  globalForPrisma.prisma || 
  new PrismaClient();

// Save the instance to avoid multiple instances in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
