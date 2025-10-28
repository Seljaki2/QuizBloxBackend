import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { SessionsGateway } from './sessions.gateway';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Session]), FirebaseModule, UsersModule],
  providers: [SessionsGateway],
})
export class SessionsModule {}
