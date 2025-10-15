import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class SubjectsService {
  constructor (
    @InjectRepository(Subject) private readonly subject: Repository<Subject>
  ) {}

  public getAll() {
    return this.subject.find()
  }

  public create(newSubject: DeepPartial<Subject>) {
    const subjectEntity = this.subject.create(newSubject);
    return this.subject.save(subjectEntity)
  }

  public update(subjectId: string, usubject: Partial<Subject>) {
    return this.subject.update({
      id: subjectId
    }, usubject)
  }

  public delete(subjectId: string) {
    return this.subject.delete({
      id: subjectId
    })
  }
}
