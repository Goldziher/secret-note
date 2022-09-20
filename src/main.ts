/* istanbul ignore file */
import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app/app.module';
import { PrismaService } from './prisma.service';

(async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
    );
    const prismaService = app.get(PrismaService);
    await prismaService.enableShutdownHooks(app);
    await app.listen(process.env.SERVER_PORT ?? 3000);
})();
