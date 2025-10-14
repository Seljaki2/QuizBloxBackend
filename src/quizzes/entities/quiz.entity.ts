import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { Question } from '../../questions/entities/question.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Quiz extends Base {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @ManyToOne(() => Subject, (subject) => subject.id, { nullable: false })
  subject: Subject;

  @Column({ nullable: true })
  image: string;

  @ManyToMany(() => Question)
  @JoinTable({ name: 'quiz_question' })
  questions: Question[];

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  creator: User;

  @Column({ default: false })
  isPublic: boolean;

  @Column('json', { nullable: true })
  options?: any;
}
