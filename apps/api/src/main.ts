/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 8080;
    await app.listen(port, '0.0.0.0');
    Logger.log(
      `🚀 Application is running on: http://0.0.0.0:${port}/${globalPrefix}`,
    );
  } catch (error) {
    Logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
