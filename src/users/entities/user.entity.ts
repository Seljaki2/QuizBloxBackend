import { Column, Entity } from 'typeorm';
import { Base } from '../../common/entities/base.entity';

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
}
