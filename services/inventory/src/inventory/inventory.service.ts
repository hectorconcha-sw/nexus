import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReserveStockDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  // Admin method to set initial stock
  async setStock(productId: string, quantity: number) {
    return this.prisma.stockLevel.upsert({
      where: { productId },
      update: { quantity },
      create: { productId, quantity },
    });
  }

  async getStock(productId: string) {
    const stock = await this.prisma.stockLevel.findUnique({
      where: { productId },
    });
    if (!stock) throw new NotFoundException('Product not found in inventory');
    return stock;
  }

  async reserveStock(dto: ReserveStockDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch current stock
      const stock = await tx.stockLevel.findUnique({
        where: { productId: dto.productId },
      });

      if (!stock) {
        throw new NotFoundException('Product not found in inventory');
      }

      if (stock.quantity < dto.quantity) {
        throw new BadRequestException('Insufficient stock available');
      }

      // 2. Atomically decrement the stock
      await tx.stockLevel.update({
        where: { productId: dto.productId },
        data: { quantity: { decrement: dto.quantity } },
      });

      // 3. Create the reservation record (expires in 15 minutes)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      return tx.reservation.create({
        data: {
          productId: dto.productId,
          quantity: dto.quantity,
          expiresAt,
          status: 'PENDING',
        },
      });
    });
  }

  async confirmReservation(reservationId: string) {
    return this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'CONFIRMED' },
    });
  }

  async releaseReservation(reservationId: string) {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
      });

      if (!reservation || reservation.status !== 'PENDING') {
        throw new BadRequestException('Invalid or already processed reservation');
      }

      // 1. Put the stock back
      await tx.stockLevel.update({
        where: { productId: reservation.productId },
        data: { quantity: { increment: reservation.quantity } },
      });

      // 2. Mark reservation as cancelled
      return tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'CANCELLED' },
      });
    });
  }
}
