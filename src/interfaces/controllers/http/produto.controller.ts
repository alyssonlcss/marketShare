import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UsePipes, ValidationPipe, UseGuards, HttpCode, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../../domain/auth/guard/jwt-auth.guard';
import { ProdutoService } from '../../../domain/services/produto.service';
import { CreateProdutoDto } from '../../../application/dto/create-produto.dto';
import { UpdateProdutoDto } from '../../../application/dto/update-produto.dto';
import { FilterProdutoDto } from '../../../application/dto/filter-produto.dto';

@UseGuards(JwtAuthGuard)
@Controller('produto')
export class ProdutoController {
    constructor(private readonly produtoService: ProdutoService) {}

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    create(@Req() req, @Body() dto: CreateProdutoDto) {
        return this.produtoService.create(dto, req.user.userId);
    }

    @Get()
    findAll(@Req() req, @Query() filters: FilterProdutoDto) {
        return this.produtoService.findAll(req.user.userId, filters);
    }

    @Get(':id')
    findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.produtoService.findOne(id, req.user.userId);
    }

    @Patch(':id')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    update(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProdutoDto) {
        return this.produtoService.update(id, dto, req.user.userId);
    }

    @Delete(':id')
    @HttpCode(204)
    remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
        return this.produtoService.remove(id, req.user.userId);
    }
}
