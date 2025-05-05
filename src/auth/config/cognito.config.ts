import { registerAs } from '@nestjs/config';
import { CognitoConfig } from './cognito-config.type';
import validateConfig from '../../utils/validate-config';
import { IsString, IsNotEmpty } from 'class-validator';

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  COGNITO_USER_POOL_ID: string;

  @IsString()
  @IsNotEmpty()
  COGNITO_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  COGNITO_REGION: string;
}

export default registerAs<CognitoConfig>('cognito', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    userPoolId: process.env.COGNITO_USER_POOL_ID!,
    clientId: process.env.COGNITO_CLIENT_ID!,
    region: process.env.COGNITO_REGION!,
  };
});
