import { Controller, Get } from '@nestjs/common';

@Controller('main')
export class MainController {
  @Get()
  async test() {
    return 'hahaha';
  }
}
