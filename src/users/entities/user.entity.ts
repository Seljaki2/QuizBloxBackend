import { Column, Entity, OneToMany } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { Quiz } from 'src/quizzes/entities/quiz.entity';

@Entity()
export class User extends Base {
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

  @Column()
  isAdmin: boolean;

  @OneToMany(() => Quiz, (quiz) => quiz.creator)
  quizzes: Quiz[];
}
