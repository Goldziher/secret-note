import { HttpStatus, INestApplication } from '@nestjs/common';
import { SuperTest } from 'supertest';
import { HEALTH_MESSAGE } from '../../src/constant';
import { nestTestBootstrap } from '../test-utils';

describe('App Controller Tests', () => {
    let app: INestApplication;
    let request: SuperTest<any>;

    beforeAll(async () => {
        const bootstrap = await nestTestBootstrap();
        request = bootstrap.request;
        app = bootstrap.app;
    });

    afterAll(async () => {
        await app.close();
    });

    it('get /health-check', async () => {
        const response = await request.get('/health-check');
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual({ status: HEALTH_MESSAGE });
    });
});
