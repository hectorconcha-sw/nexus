import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  async getBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } },
    });
    if (!category) {
      throw new NotFoundException(`Category '${slug}' not found`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(`Category with slug '${dto.slug}' already exists`);
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
      },
    });
  }
}
