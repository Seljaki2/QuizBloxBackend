import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { Quiz } from './entities/quiz.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { type FirebasePayload, GetPayload } from '../auth/get-user.decorator';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { DeleteResult, UpdateResult } from 'typeorm';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  async findAll(): Promise<Quiz[]> {
    return await this.quizzesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Quiz | null> {
    return await this.quizzesService.findOne(id);
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async create(
    @Body() createQuizDto: CreateQuizDto,
    @GetPayload() payload: FirebasePayload,
  ): Promise<Quiz> {
    return await this.quizzesService.create(createQuizDto, payload);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatedQuiz: Partial<Quiz>,
  ): Promise<UpdateResult> {
    return await this.quizzesService.update(id, updatedQuiz);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<DeleteResult> {
    return await this.quizzesService.delete(id);
  }
}
