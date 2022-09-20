import { HttpStatus, INestApplication } from '@nestjs/common';
import { SuperTest } from 'supertest';
import { nestTestBootstrap } from '../test-utils';
import { AppModule } from '../../src/app/app.module';
import { NoteModule } from '../../src/api/note/note.module';
import { Note, PrismaClient } from '@prisma/client';
import * as kms from '../../src/utils/kms';

describe('Note Controller Tests', () => {
    let app: INestApplication;
    let request: SuperTest<any>;
    let prisma: PrismaClient;

    beforeAll(async () => {
        const bootstrap = await nestTestBootstrap({
            imports: [AppModule, NoteModule],
        });
        request = bootstrap.request;
        app = bootstrap.app;
        prisma = bootstrap.prisma;
    });

    afterEach(async () => {
        await prisma.note.deleteMany({});
    });

    afterAll(async () => {
        await app.close();
    });

    const baseUrl = '/note';
    const content = 'lorem ipsum';

    describe(`POST ${baseUrl}`, () => {
        it.each([{}, { content: '' }])(
            'returns status 400 response when content equals %s',
            async (body) => {
                const response = await request.post(baseUrl).send(body);
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );
        it('returns status 201 response with created Note', async () => {
            const response = await request.post(baseUrl).send({ content });
            expect(response.status).toBe(HttpStatus.CREATED);
            const note = await prisma.note.findFirstOrThrow();
            expect(response.body.id).toEqual(note.id);
            expect(response.body.content).toEqual(note.content);
        });
    });

    describe(`GET ${baseUrl}/:id`, () => {
        let note: Note;

        beforeEach(async () => {
            await request.post(baseUrl).send({ content });
            note = await prisma.note.findFirstOrThrow();
        });

        it.each(['abc', '123'])(
            'returns status 400 response when a non-uuid ID parm param is provided (test value: %s)',
            async (pathParam) => {
                const response = await request.get(`${baseUrl}/${pathParam}`);
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it('returns status 400 response when a false ID is provided', async () => {
            const falseUUID = 'dc7dd2ea-629a-4443-8872-d45044d771a5';
            const response = await request.get(`${baseUrl}/${falseUUID}`);
            expect(response.status).toBe(HttpStatus.BAD_REQUEST);
        });

        it('returns status 503 response when a cryptographic key retrieval error fails', async () => {
            const getCryptographicKeyOrThrowSpy = jest.spyOn(
                kms,
                'getCryptographicKeyOrThrow',
            );
            getCryptographicKeyOrThrowSpy.mockImplementationOnce(() => {
                throw new Error();
            });
            const response = await request.get(`${baseUrl}/${note.id}`);
            expect(response.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
            getCryptographicKeyOrThrowSpy.mockClear();
        });

        it('returns status 200 response with decrypted contents by default', async () => {
            const response = await request.get(`${baseUrl}/${note.id}`);
            expect(response.status).toBe(HttpStatus.OK);
            const { body } = response as { body: Note };
            expect(body.id).toEqual(note.id);
            expect(body.content).toEqual(content);
            expect(body.initializationVector).toBeUndefined();
        });

        it('returns status 200 response with encrypted contents when encrypted=true', async () => {
            const response = await request.get(
                `${baseUrl}/${note.id}?encrypted=true`,
            );
            expect(response.status).toBe(HttpStatus.OK);
            const { body } = response as { body: Note };
            expect(body.id).toEqual(note.id);
            expect(body.content).toEqual(note.content);
        });
    });

    describe(`PATCH ${baseUrl}/:id`, () => {
        let note: Note;

        beforeEach(async () => {
            await request.post(baseUrl).send({ content });
            note = await prisma.note.findFirstOrThrow();
        });

        const newContent = 'new content 123';

        it.each(['abc', '123'])(
            'returns status 400 response when a non-uuid ID parm param is provided (test value: %s)',
            async (pathParam) => {
                const response = await request
                    .patch(`${baseUrl}/${pathParam}`)
                    .send({ content: newContent });
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it('returns status 200 response and updates note correctly', async () => {
            const response = await request
                .patch(`${baseUrl}/${note.id}`)
                .send({ content: newContent });
            expect(response.status).toBe(HttpStatus.OK);
            const updatedNote = await prisma.note.findFirstOrThrow();
            expect(response.body.id).toEqual(updatedNote.id);
            expect(response.body.content).toEqual(updatedNote.content);
            const {
                body: { content: decryptedContent },
            } = await request.get(`${baseUrl}/${note.id}`);
            expect(decryptedContent).toEqual(newContent);
        });
    });

    describe(`DELETE ${baseUrl}/:id`, () => {
        let note: Note;

        beforeEach(async () => {
            await request.post(baseUrl).send({ content });
            note = await prisma.note.findFirstOrThrow();
        });

        it.each(['abc', '123'])(
            'returns status 400 response when a non-uuid ID parm param is provided (test value: %s)',
            async (pathParam) => {
                const response = await request.delete(
                    `${baseUrl}/${pathParam}`,
                );
                expect(response.status).toBe(HttpStatus.BAD_REQUEST);
            },
        );

        it('returns status 204 response and updates note correctly', async () => {
            expect(
                await prisma.note.findFirst({ where: { id: note.id } }),
            ).toBeDefined();
            const response = await request.delete(`${baseUrl}/${note.id}`);
            expect(response.status).toBe(HttpStatus.NO_CONTENT);
            expect(
                await prisma.note.findFirst({ where: { id: note.id } }),
            ).toBeNull();
        });
    });
});
