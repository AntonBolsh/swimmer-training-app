import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SwimmersService } from './swimmers.service';
import { Prisma } from 'generated/prisma';

@Controller('swimmers')
export class SwimmersController {
  constructor(private readonly swimmersService: SwimmersService) {}

  @Post()
  create(@Body() createSwimmerDto: Prisma.SwimmerCreateInput) {
    return this.swimmersService.create(createSwimmerDto);
  }

  @Get()
  findAll() {
    return this.swimmersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.swimmersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSwimmerDto: Prisma.SwimmerCreateInput,
  ) {
    return this.swimmersService.update(+id, updateSwimmerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.swimmersService.remove(+id);
  }
}
