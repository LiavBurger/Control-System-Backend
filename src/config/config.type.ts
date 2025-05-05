import { AppConfig } from './app-config.type';
import { DatabaseConfig } from '../database/config/database-config.type';
import { FileConfig } from '../files/config/file-config.type';
import { CognitoConfig } from '../auth/config/cognito-config.type';

export type AllConfigType = {
  app: AppConfig;
  auth: CognitoConfig;
  database: DatabaseConfig;
  file: FileConfig;
};
