import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Quiz } from '../../quizzes/entities/quiz.entity';

@Entity()
export class Subject extends Base {
  @Column({ nullable: false })
  name: string;

  @ManyToMany(() => User)
  @JoinTable({ name: 'teacher_subject' })
  teacher: User[];

  @OneToMany(() => Quiz, (quiz) => quiz.subject)
  quizzes: Quiz[];
}
