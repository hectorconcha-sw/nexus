import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ProductsService, type ListProductsQuery } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductStatus } from '../generated/prisma/enums.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(
    @Query('status') status?: ProductStatus,
    @Query('category') categorySlug?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const query: ListProductsQuery = {
      status,
      categorySlug,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    };
    return this.productsService.list(query);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.productsService.getBySlug(slug);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}
