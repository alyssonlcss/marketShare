import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from '../../../domain/auth/service/auth.service';
import { LocalAuthGuard } from '../../../domain/auth/guard/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
