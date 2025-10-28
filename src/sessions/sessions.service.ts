import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session) private readonly session: Repository<Session>,
  ) {}

  create(s: Partial<Session>) {
    return this.session.save(this.session.create(s));
  }
}
