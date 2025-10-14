import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Quiz } from '../../quizzes/entities/quiz.entity';

@Entity()
export class Session extends Base {
  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  host: User;

  @ManyToOne(() => Quiz, (quiz) => quiz.id, { nullable: false })
  quiz: Quiz;

  @Column({ nullable: true })
  endTime: Date;
}
