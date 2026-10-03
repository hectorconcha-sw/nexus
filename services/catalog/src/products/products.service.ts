import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductStatus } from '../generated/prisma/enums.js';

export interface ListProductsQuery {
  status?: ProductStatus;
  categorySlug?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListProductsQuery) {
    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.categorySlug) {
      where.category = { slug: query.categorySlug };
    }

    const limit = Math.min(query.limit ?? 20, 100);
    const offset = query.offset ?? 0;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, limit, offset };
  }

  async getBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`Product '${slug}' not found`);
    }
    return product;
  }

  async create(dto: CreateProductDto) {
    const conflict = await this.prisma.product.findFirst({
      where: {
        OR: [{ slug: dto.slug }, { sku: dto.sku }],
      },
      select: { slug: true, sku: true },
    });
    if (conflict) {
      const field = conflict.slug === dto.slug ? 'slug' : 'sku';
      throw new ConflictException(`Product with ${field} '${dto[field]}' already exists`);
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
        select: { id: true },
      });
      if (!category) {
        throw new NotFoundException(`Category '${dto.categoryId}' not found`);
      }
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        sku: dto.sku,
        description: dto.description,
        priceCents: dto.priceCents,
        status: dto.status ?? ProductStatus.DRAFT,
        categoryId: dto.categoryId,
      },
      include: { category: true },
    });
  }
}
