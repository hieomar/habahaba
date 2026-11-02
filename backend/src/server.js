import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { prisma } from './config/database.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 GTMS Backend API running on port ${PORT} in ${env.NODE_ENV} mode`);
  logger.info(`🔗 Health check available at http://localhost:${PORT}/api/v1/health`);
});

const handleShutdown = async (signal) => {
  logger.info(`🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Database connection closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
