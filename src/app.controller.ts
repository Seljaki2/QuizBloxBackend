import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { FirebaseAuthGuard } from './auth/auth.guard';
import { type FirebasePayload, GetPayload } from './auth/get-user.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('/testAuth')
  testAuth(@GetPayload() payload: FirebasePayload) {
    return payload;
  }
}
