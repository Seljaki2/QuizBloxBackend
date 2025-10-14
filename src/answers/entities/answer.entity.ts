import { Column, Entity, ManyToMany } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity()
export class Answer extends Base {
  @Column({ nullable: false })
  text: string;

  @Column({ nullable: false })
  isCorrect: boolean;

  @ManyToMany(() => Question)
  questions: Question[];
}
