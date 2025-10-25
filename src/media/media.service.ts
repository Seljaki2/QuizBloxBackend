import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Media } from './entities/media.entity';
import { Repository } from 'typeorm';
import { unlink } from 'fs';
import path from 'path';
import { UPLOAD_DESTINATION } from 'src/media/upload-destination';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media) private readonly media: Repository<Media>,
  ) {}

  async uploadMedia(file: Express.Multer.File): Promise<Media> {
    const id = uuidv4();
    const filename = `${id}-${file.originalname}`;
    fs.writeFileSync(path.join(UPLOAD_DESTINATION, filename), file.buffer);

    const mediaEntity = this.media.create({
      id,
      path: filename,
    });

    return this.media.save(mediaEntity);
  }

  getFile(mediaId: string) {
    return this.media.findOneBy({ id: mediaId });
  }

  async deleteMedia(mediaId: string): Promise<void> {
    const media = await this.getFile(mediaId);
    if (!media) {
      throw new Error('Media not found');
    }
    unlink(path.join(UPLOAD_DESTINATION, media.path), (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
    });
    await this.media.delete({ id: mediaId });
  }
}
