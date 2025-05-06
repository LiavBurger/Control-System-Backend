import { AppConfig } from './app-config.type';
import { DatabaseConfig } from '../database/config/database-config.type';
import { CognitoConfig } from '../auth/config/cognito-config.type';

export type AllConfigType = {
  app: AppConfig;
  auth: CognitoConfig;
  database: DatabaseConfig;
};
