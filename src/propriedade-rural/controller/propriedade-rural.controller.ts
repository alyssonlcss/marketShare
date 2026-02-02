import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UsePipes, ValidationPipe, UseGuards, HttpCode, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { PropriedadeRuralService } from '../service/propriedade-rural.service';
import { CreatePropriedadeRuralDto } from '../dto/create-propriedade-rural.dto';
import { UpdatePropriedadeRuralDto } from '../dto/update-propriedade-rural.dto';
import { FilterPropriedadeRuralDto } from '../dto/filter-propriedade-rural.dto';

@UseGuards(JwtAuthGuard)
@Controller('propriedade-rural')
export class PropriedadeRuralController {
    constructor(private readonly propriedadeRuralService: PropriedadeRuralService) {}

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    create(@Body() dto: CreatePropriedadeRuralDto) {
        return this.propriedadeRuralService.create(dto);
    }

    @Get()
    findAll(@Req() req, @Query() filters: FilterPropriedadeRuralDto) {
        return this.propriedadeRuralService.findAll(req.user.userId, filters);
    }

    @Get(':id')
    findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.propriedadeRuralService.findOne(id, req.user.userId);
    }

    @Patch(':id')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    update(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePropriedadeRuralDto) {
        return this.propriedadeRuralService.update(id, dto, req.user.userId);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.propriedadeRuralService.remove(id, req.user.userId);
    }
}
