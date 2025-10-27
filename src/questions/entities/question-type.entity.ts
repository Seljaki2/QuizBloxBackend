import { Base } from '../../common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class QuestionType extends Base {
  @Column()
  type: string;
}
