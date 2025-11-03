import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { type FirebasePayload, GetPayload } from '../auth/get-user.decorator';
import { UsersService } from '../users/users.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  async findAllByHost(@GetPayload() payload: FirebasePayload) {
    return await this.sessionsService.findAllByHost(payload.user_id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.sessionsService.findOne(id);
  }

  @Get(':id/results')
  @UseGuards(FirebaseAuthGuard)
  async findAllResultsBySession(
    @Param('id') id: string,
    @GetPayload() payload: FirebasePayload,
  ) {
    return await this.sessionsService.findAllResultsBySession(id, payload);
  }
}
