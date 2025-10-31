import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateResultDto } from './dto/create-result.dto';
import { ResultsService } from './results.service';
import { type FirebasePayload, GetPayload } from '../auth/get-user.decorator';

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  async findAllByUser(@GetPayload() payload: FirebasePayload) {
    return await this.resultsService.findAllByUser(payload);
  }

  @Post()
  async create(
    @Body() createResultDto: CreateResultDto,
    @GetPayload() payload: FirebasePayload,
  ) {
    return await this.resultsService.create(createResultDto, payload);
  }
}
