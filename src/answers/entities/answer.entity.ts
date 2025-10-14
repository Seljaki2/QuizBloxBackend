import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Question } from '../../questions/entities/question.entity';
import { Result } from '../../results/entities/result.entity';

@Entity()
export class Answer extends Base {
  @Column({ nullable: false })
  text: string;

  @Column({ nullable: false })
  isCorrect: boolean;

  @ManyToMany(() => Question)
  questions: Question[];

  @OneToMany(() => Result, (result) => result.answer)
  results: Result[];
}
