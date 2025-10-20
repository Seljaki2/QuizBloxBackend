import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Answer } from '../../answers/entities/answer.entity';

@Entity()
export class Question extends Base {
  @Column({ nullable: true })
  text: string;

  @Column({ nullable: true })
  media: string;

  @ManyToMany(() => Answer)
  @JoinTable({ name: 'question_answer' })
  answers: Answer[];

  @Column('json', { nullable: true })
  options?: any;
}
