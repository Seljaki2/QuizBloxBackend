import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { IsAdmin } from 'src/auth/admin.decorator';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { type FirebasePayload, GetPayload } from 'src/auth/get-user.decorator';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Controller('subjects')
export class SubjectsController {
  constructor (
    private readonly subjectsService: SubjectsService
  ) {}

  @Get()
  async getAll() {
    return {
      subjects: await this.subjectsService.getAll()
    }
  }

  @Post()
  @IsAdmin()
  async createSubject(
    @Body() csDto: CreateSubjectDto
  ) {
    return await this.subjectsService.create(csDto)
  }

  @Put(':id')
  @IsAdmin()
  async updateSubject(
    @Param('id', new ParseUUIDPipe()) sid: string,
    @Body() usDto: UpdateSubjectDto
  ) {
    return await this.subjectsService.update(sid, usDto)
  }

  @Delete(':id')
  @IsAdmin()
  async deleteSubject(
    @Param('id', new ParseUUIDPipe()) sid: string,
  ) {
    return await this.subjectsService.delete(sid)
  }
}
