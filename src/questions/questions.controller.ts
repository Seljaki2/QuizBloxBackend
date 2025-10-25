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
import { QuestionsService } from './questions.service';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { DeleteResult } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { FILES_IMAGES_VIDEOS } from 'src/media/file-types';
import { MediaService } from 'src/media/media.service';
import { Media } from 'src/media/entities/media.entity';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async findAll(): Promise<Question[]> {
    return this.questionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Question | null> {
    return this.questionsService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createQuestionDto: CreateQuestionDto,
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
  ) {
    let media: Media | undefined;
    if (file) media = await this.mediaService.uploadMedia(file);
    return await this.questionsService.create(createQuestionDto, media);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
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
  ) {
    let media: Media | undefined;
    if (file) media = await this.mediaService.uploadMedia(file);
    return await this.questionsService.update(id, updateQuestionDto, media);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<DeleteResult> {
    return await this.questionsService.delete(id);
  }
}
