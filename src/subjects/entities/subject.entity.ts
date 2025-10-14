import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Base } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Subject extends Base {
  @Column({ nullable: false })
  name: string;

  @ManyToMany(() => User)
  @JoinTable({ name: 'teacher_subject' })
  teacher: User[];
}
