import { Base } from '../../common/entities/base.entity';
import { User } from './user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Session } from '../../sessions/entities/session.entity';

@Entity()
export class UserSessionScore extends Base {
  @ManyToOne(() => User, (user) => user.sessionScores, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Session)
  session: Session;

  @Column()
  totalScore: number;
}
