import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app/app.module';
import * as supertest from 'supertest';
import type { SuperTest } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces/modules/module-metadata.interface';
import { PrismaService } from '../src/prisma.service';
import { PrismaClient } from '@prisma/client';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';

export async function nestTestBootstrap(
    metaData: ModuleMetadata = {
        imports: [AppModule],
        providers: [PrismaService],
    },
): Promise<{
    app: INestApplication;
    request: SuperTest<any>;
    prisma: PrismaClient;
}> {
    const moduleFixture: TestingModule = await Test.createTestingModule(
        metaData,
    ).compile();
    const app = moduleFixture.createNestApplication<NestFastifyApplication>(
        new FastifyAdapter(),
    );
    const prismaService = app.get(PrismaService);
    await prismaService.enableShutdownHooks(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    return {
        app,
        request: supertest(app.getHttpServer()),
        prisma: prismaService,
    };
}
