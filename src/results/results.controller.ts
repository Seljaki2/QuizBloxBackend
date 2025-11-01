import { Body, Controller, Get, Post } from '@nestjs/common';
import { ResultsService } from './results.service';
import { type FirebasePayload, GetPayload } from '../auth/get-user.decorator';
import { CreateResultDto } from './dto/create-result.dto';

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  async findAllByUser(@GetPayload() payload: FirebasePayload) {
    return await this.resultsService.findAllByUser(payload);
  }

  @Post()
  async create(@Body() createResultDto: CreateResultDto) {
    return await this.resultsService.create(createResultDto);
  }
}
