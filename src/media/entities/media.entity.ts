import { unlink } from 'fs';
import path from 'path';
import { Base } from 'src/common/entities/base.entity';
import { AfterRemove, BeforeRemove, Column, Entity } from 'typeorm';
import { UPLOAD_DESTINATION } from '../upload-destination';

@Entity()
export class Media extends Base {
  @Column({ nullable: false })
  path: string;

  @BeforeRemove()
  removeFile() {
    console.log('Deleting file at path:');
    unlink(path.join(UPLOAD_DESTINATION, this.path), (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
    });
  }
}
