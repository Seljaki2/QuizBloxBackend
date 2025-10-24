import { Base } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Media extends Base {
  @Column({ nullable: false })
  path: string;
}
