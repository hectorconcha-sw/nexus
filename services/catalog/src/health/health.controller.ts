import { Controller, Get } from '@nestjs/common';

interface HealthResponse {
  status: 'ok';
  service: string;
  uptime: number;
  timestamp: string;
}

@Controller('health')
export class HealthController {
  @Get()
  check(): HealthResponse {
    return {
      status: 'ok',
      service: 'catalog',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
