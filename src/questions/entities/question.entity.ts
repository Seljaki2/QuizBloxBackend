import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Answer } from '../../answers/entities/answer.entity';
import { Media } from 'src/media/entities/media.entity';

export enum QuestionType {
  CUSTOM_ANWSER = 'CUSTOM_ANWSER',
  MEDIA_ANWSER = 'MEDIA_ANWSER',
  PRESET_ANWSER = 'PRESET_ANWSER',
}

@Entity()
export class Question extends Base {
  @Column({ nullable: true })
  text: string;

  @OneToMany(() => Answer, (answer) => answer.question, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  answers?: Answer[];

  @OneToOne(() => Media, { nullable: true })
  media?: Media;

  @Column({ nullable: true })
  customTime: number;

  @Column({ type: 'enum', enum: QuestionType })
  questionType: QuestionType;
}
