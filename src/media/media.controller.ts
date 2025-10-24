import {
  Controller,
  Delete,
  HttpException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { UploadFileInterceptor } from './upload-file.interceptor';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(UploadFileInterceptor('file'))
  async uploadMedia(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new HttpException('No file uploaded', 400);
    return this.mediaService.createFile(file.filename); //this.mediaService.uploadFile(file.buffer, file.mimetype);
  }

  @Delete(':id')
  async deleteMedia(@Param('id') mediaId: string) {
    return this.mediaService.deleteFile(mediaId);
  }
}
