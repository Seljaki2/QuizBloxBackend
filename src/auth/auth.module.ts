import { Module } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [
    {
      provide: "APP_GUARD",
      useClass: RolesGuard
    }
  ],
  imports: [
    UsersModule
  ]
})
export class AuthModule {}
