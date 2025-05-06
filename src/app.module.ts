import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './database/config/database.config';
import appConfig from './config/app.config';
import { ConfigModule } from '@nestjs/config';
import { HomeModule } from './home/home.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './database/mongoose-config.service';
import cognitoConfig from './auth/config/cognito.config';

const infrastructureDatabaseModule = MongooseModule.forRootAsync({
  useClass: MongooseConfigService,
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, cognitoConfig],
      envFilePath: ['.env'],
    }),
    infrastructureDatabaseModule,
    AuthModule,
    HomeModule,
  ],
})
export class AppModule {}
