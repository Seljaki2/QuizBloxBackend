import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Question } from '../../questions/entities/question.entity';
import { Result } from '../../results/entities/result.entity';
import { Media } from 'src/media/entities/media.entity';

@Entity()
export class Answer extends Base {
  @Column({ nullable: true })
  text: string;

  @Column({ type: 'int', default: 0 })
  position: number;

  @Column({ type: 'boolean', default: false })
  isCorrect: boolean;

  @ManyToOne(() => Question, (question) => question.answers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  question: Question;

  @OneToMany(() => Result, (result) => result.answer, { nullable: true })
  results: Result[];

  @OneToOne(() => Media, { nullable: true })
  media?: Media;
}
