import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Answer } from '../../answers/entities/answer.entity';
import { Media } from 'src/media/entities/media.entity';

@Entity()
export class Question extends Base {
  @Column({ nullable: true })
  text: string;

  @ManyToMany(() => Answer)
  @JoinTable({ name: 'question_answer' })
  answers: Answer[];

  @ManyToOne(() => Answer, { nullable: false })
  @JoinColumn({ name: 'correct_answer_id' })
  correctAnswer: Answer;

  @OneToOne(() => Media, { nullable: true })
  media?: Media;

  @Column('json', { nullable: true })
  options?: any;
}
