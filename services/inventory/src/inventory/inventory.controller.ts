import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ReserveStockDto } from './dto/inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // For testing/seeding via Kong
  @Post('stock')
  setStock(@Body() body: { productId: string; quantity: number }) {
    return this.inventoryService.setStock(body.productId, body.quantity);
  }

  @Get('stock/:productId')
  getStock(@Param('productId') productId: string) {
    return this.inventoryService.getStock(productId);
  }

  @Post('reserve')
  reserve(@Body() dto: ReserveStockDto) {
    return this.inventoryService.reserveStock(dto);
  }

  @Post('reserve/:id/release')
  release(@Param('id') id: string) {
    return this.inventoryService.releaseReservation(id);
  }
}
