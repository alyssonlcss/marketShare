import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UsePipes, ValidationPipe, UseGuards, HttpCode, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { LeadService } from '../service/lead.service';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { UpdateLeadDto } from '../dto/update-lead.dto';
import { FilterLeadDto } from '../dto/filter-lead.dto';

@UseGuards(JwtAuthGuard)
@Controller('lead')
export class LeadController {
    constructor(private readonly leadService: LeadService) {}

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    create(@Body() createLeadDto: CreateLeadDto) {
        return this.leadService.create(createLeadDto);
    }

    @Get()
    findAll(@Req() req, @Query() filters: FilterLeadDto) {
        return this.leadService.findAll(req.user.userId, filters);
    }

    @Get(':id')
    findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.leadService.findOne(id, req.user.userId);
    }

    @Patch(':id')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    patch(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() updateLeadDto: UpdateLeadDto) {
        return this.leadService.update(id, updateLeadDto, req.user.userId);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.leadService.remove(id, req.user.userId);
    }
}
