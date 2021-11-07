import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MarketApi } from './market.api';

@Module({
  imports: [HttpModule],
  providers: [MarketApi],
  exports: [MarketApi],
})
export class ApiModule {}
