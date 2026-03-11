/**
 * Exposes ICE domain services to the application layer.
 */
import { Module } from '@nestjs/common';
import { IceService } from './ice.service';

@Module({
  providers: [IceService],
  exports: [IceService],
})
export class IceModule {}
