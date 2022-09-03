import { Controller, Post, UseGuards } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { AdminGuard } from 'src/provider/auth/auth.guard';
import { ISRProvider } from 'src/provider/isr/isr.provider';

@ApiTags('isr')
@UseGuards(...AdminGuard)
@Controller('/api/admin/isr')
export class ISRController {
  constructor(private readonly isrProvider: ISRProvider) {}
  @Post()
  async activeISR() {
    await this.isrProvider.activeAll('手动触发 ISR');
    return {
      statusCode: 200,
      data: '触发成功！',
    };
  }
}
