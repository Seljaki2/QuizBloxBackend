import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Answer } from '../../answers/entities/answer.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Result extends Base {
  @ManyToOne(() => User, (user) => user.results, { nullable: true })
  user?: User;

  @Column({ nullable: true })
  username?: string;

  @ManyToOne(() => Answer, (answer) => answer.results, { nullable: false })
  answer: Answer;

  @Column({ nullable: true })
  userEntry?: string;
}
