import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MarketApi } from './market.api';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [MarketApi],
  exports: [MarketApi],
})
export class ApiModule {}
