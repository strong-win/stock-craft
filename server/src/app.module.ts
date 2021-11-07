import { mongooseConfig } from './configs/mongoose.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServicesModule } from './services/services.module';
import { GatewaysModule } from './gateways/gateways.module';
import SampleConfig from './configs/sample.config';
import { StatesModule } from './states/states.modules';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [SampleConfig] }),
    mongooseConfig,
    ServicesModule,
    GatewaysModule,
    StatesModule,
    ProvidersModule,
  ],
})
export class AppModule {}
