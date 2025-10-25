import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { MediaService } from 'src/media/media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FILES_IMAGES_VIDEOS } from 'src/media/file-types';
import { Media } from 'src/media/entities/media.entity';

@Controller('answers')
export class AnswersController {
  constructor(
    private readonly answersService: AnswersService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async findAll(): Promise<Answer[]> {
    return this.answersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Answer | null> {
    return this.answersService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createAnswerDto: CreateAnswerDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB
          new FileTypeValidator({ fileType: FILES_IMAGES_VIDEOS }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ): Promise<Answer> {
    let media: Media | undefined;
    if (file) media = await this.mediaService.uploadMedia(file);

    return await this.answersService.create(createAnswerDto, media);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() updateAnswerDto: UpdateAnswerDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB
          new FileTypeValidator({ fileType: FILES_IMAGES_VIDEOS }),
        ],
      }),
    )
    file?: Express.Multer.File,
  ): Promise<UpdateResult> {
    let media: Media | undefined;
    if (file) media = await this.mediaService.uploadMedia(file);

    return await this.answersService.update(id, updateAnswerDto, media);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<DeleteResult> {
    return await this.answersService.delete(id);
  }
}
