import { mongooseConfig } from './configs/mongoose.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServicesModule } from './services/services.module';
import { GatewaysModule } from './gateways/gateways.module';
import { RepositoriesModule } from './repositories/repositories.module';
import SampleConfig from './configs/sample.config';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [SampleConfig] }),
    mongooseConfig,
    ServicesModule,
    GatewaysModule,
    RepositoriesModule,
  ],
})
export class AppModule {}
