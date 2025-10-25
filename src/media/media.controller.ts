import {
  Controller,
  Delete,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FILES_IMAGES } from './file-types';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB
          new FileTypeValidator({ fileType: FILES_IMAGES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.mediaService.uploadMedia(file); //this.mediaService.uploadFile(file.buffer, file.mimetype);
  }

  @Delete(':id')
  async deleteMedia(@Param('id') mediaId: string) {
    return this.mediaService.deleteMedia(mediaId);
  }
}
