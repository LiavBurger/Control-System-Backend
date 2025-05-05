import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { AllConfigType } from '../../config/config.type';
import { CognitoConfig } from '../config/cognito-config.type';
import { CognitoJwtVerifierSingleUserPool } from 'aws-jwt-verify/cognito-verifier';

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  private readonly logger = new Logger(CognitoAuthGuard.name); // Add logger
  private verifier: CognitoJwtVerifierSingleUserPool<{
    userPoolId: string;
    tokenUse: 'access'; // Ensure this matches the token type sent by your frontend ('id' or 'access')
    clientId: string;
  }>; // Instance type will be inferred by CognitoJwtVerifier.create

  constructor(private configService: ConfigService<AllConfigType>) {
    // Retrieve the whole cognito configuration object first
    const cognitoConfig = this.configService.get<CognitoConfig>('cognito', {
      infer: true,
    });
    console.log('cognitoConfig', cognitoConfig);
    if (
      !cognitoConfig?.userPoolId ||
      !cognitoConfig?.clientId ||
      !cognitoConfig?.region
    ) {
      this.logger.error(
        'FATAL ERROR: Cognito configuration is missing. Check .env variables: COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID, COGNITO_REGION',
      );
      throw new InternalServerErrorException(
        'Cognito Guard configuration error.',
      );
    }

    const userPoolId = cognitoConfig.userPoolId;
    const clientId = cognitoConfig.clientId;
    // const region = cognitoConfig.region; // Region might be needed for specific edge cases or different AWS SDK interactions, but often not directly for `create`.

    try {
      // Create the verifier instance
      this.verifier = CognitoJwtVerifier.create({
        userPoolId: userPoolId,
        tokenUse: 'access', // Ensure this matches the token type sent by your frontend ('id' or 'access')
        clientId: clientId,
        // Optionally: Add custom exigences like scope checking
        // scope: ["read", "write"], // Example if you use scopes
      });
      this.logger.log('Cognito Verifier created successfully.');
    } catch (error) {
      this.logger.error('Failed to create Cognito Verifier:', error);
      throw new InternalServerErrorException(
        'Failed to initialize Cognito authentication guard.',
      );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('Authorization token not found in request header');
      throw new UnauthorizedException('Authorization token not found');
    }

    try {
      // Verify the token using the cached verifier instance
      // The verify method expects only the token string
      const payload = await this.verifier.verify(token);

      // Verification successful, attach the payload to the request object
      request['user'] = payload; // Contains claims like 'sub', 'username', 'email', etc.
      this.logger.verbose(
        `User ${payload.username} (sub: ${payload.sub}) authenticated successfully.`,
      );

      return true; // Grant access
    } catch (error) {
      this.logger.error(`Cognito JWT Verification Failed: ${error.message}`);
      // Log the detailed error for debugging if needed, but don't expose details to the client
      // console.error(error);
      throw new UnauthorizedException('Invalid or expired token'); // Deny access
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    // Ensure headers are accessed safely, common for Express request object
    const authHeader = request.headers?.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      return undefined;
    }
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
