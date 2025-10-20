import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Get()
  async findAll(): Promise<Answer[]> {
    return this.answersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Answer | null> {
    return this.answersService.findOne(id);
  }

  @Post()
  async create(@Body() createAnswerDto: CreateAnswerDto): Promise<Answer> {
    return await this.answersService.create(createAnswerDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAnswerDto: UpdateAnswerDto,
  ): Promise<UpdateResult> {
    return await this.answersService.update(id, updateAnswerDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<DeleteResult> {
    return await this.answersService.delete(id);
  }
}
