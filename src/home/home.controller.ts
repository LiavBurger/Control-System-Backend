import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { HomeService } from './home.service';
import { CognitoAuthGuard } from '../auth/guards/cognito-auth.guard';

@ApiTags('Home')
@Controller()
export class HomeController {
  constructor(private service: HomeService) {}

  @Get()
  appInfo() {
    return this.service.appInfo();
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(CognitoAuthGuard)
  @ApiOkResponse({ description: 'Returns user info from the Cognito token.' })
  getMe(@Request() req: any) {
    console.log('User payload from token:', req.user);
    return {
      message: 'Successfully accessed protected route!',
      cognitoUserInfo: req.user,
    };
  }
}
