import { Column, Entity, ManyToMany, OneToMany, OneToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Question } from '../../questions/entities/question.entity';
import { Result } from '../../results/entities/result.entity';
import { Media } from 'src/media/entities/media.entity';

@Entity()
export class Answer extends Base {
  @Column({ nullable: false })
  text: string;

  @ManyToMany(() => Question)
  questions: Question[];

  @OneToMany(() => Result, (result) => result.answer)
  results: Result[];

  @OneToOne(() => Media, { nullable: true })
  media?: Media;
}
