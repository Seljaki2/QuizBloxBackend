import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Result } from './entities/result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Result])],
})
export class ResultsModule {}
