import { Controller, Get, Logger } from '@nestjs/common';
import { HEALTH_MESSAGE } from '../constant';

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);

    @Get('health-check')
    checkHealth(): { status: string } {
        this.logger.log('Health Check request');
        return { status: HEALTH_MESSAGE };
    }
}
