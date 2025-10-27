import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Answer } from '../../answers/entities/answer.entity';
import { Media } from 'src/media/entities/media.entity';
import { QuestionType } from './question-type.entity';

@Entity()
export class Question extends Base {
  @Column({ nullable: false })
  text: string;

  @OneToMany(() => Answer, (answer) => answer.question, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  answers?: Answer[];

  @OneToOne(() => Media, { nullable: true })
  media?: Media;

  @ManyToOne(() => QuestionType)
  @JoinColumn()
  questionType: QuestionType;

  @Column({ nullable: true })
  customTime: number;
}
