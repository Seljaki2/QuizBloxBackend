import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Answer } from '../../answers/entities/answer.entity';
import { User } from '../../users/entities/user.entity';
import { Quiz } from '../../quizzes/entities/quiz.entity';
import { Question } from '../../questions/entities/question.entity';
import { Session } from '../../sessions/entities/session.entity';

@Entity()
export class Result extends Base {
  @ManyToOne(() => User, (user) => user.results, { nullable: true })
  user?: User;

  @Column({ nullable: true })
  username?: string;

  @ManyToOne(() => Quiz)
  quiz: Quiz;

  @ManyToOne(() => Question, { nullable: true })
  question?: Question;

  @ManyToOne(() => Answer, (answer) => answer.results, { nullable: true })
  answer: Answer;

  @Column({ nullable: true })
  userEntry?: string;

  @Column({ nullable: true })
  isUserEntryCorrect?: boolean;

  @ManyToOne(() => Session)
  session: Session;
}
