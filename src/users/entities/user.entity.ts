import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Quiz } from 'src/quizzes/entities/quiz.entity';
import { Result } from '../../results/entities/result.entity';
import { UserSessionScore } from './user-session-score.entity';

@Entity()
export class User {
  @PrimaryColumn('varchar', {
    length: 28,
  })
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  isTeacher: boolean;

  @Column({ default: false })
  isAdmin: boolean;

  @OneToMany(() => Quiz, (quiz) => quiz.creator)
  quizzes: Quiz[];

  @OneToMany(() => Result, (result) => result.user)
  results: Result[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => UserSessionScore,
    (userSessionScore) => userSessionScore.user,
  )
  sessionScores: UserSessionScore[];

  totalScore: number = 0;
}
