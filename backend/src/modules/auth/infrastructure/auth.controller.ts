import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../../common/decorators/public.decorator';
import { Audit } from '../../../common/decorators/audit.decorator';
import { RegisterDto } from '../application/dto/register.dto';
import { LoginDto } from '../application/dto/login.dto';
import { RefreshTokenDto } from '../application/dto/refresh-token.dto';
import { AuthResult } from '../application/dto/auth-result';
import { RegisterOfficeUseCase } from '../application/use-cases/register-office.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';

const AUTH_THROTTLE_LIMIT = parseInt(process.env.AUTH_THROTTLE_LIMIT ?? '5', 10);
const AUTH_THROTTLE = { default: { limit: AUTH_THROTTLE_LIMIT, ttl: 60_000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerOfficeUseCase: RegisterOfficeUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Audit('REGISTER', 'Office')
  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthResult> {
    return this.registerOfficeUseCase.execute(dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Audit('LOGIN', 'User')
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResult> {
    return this.loginUseCase.execute(dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthResult> {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.logoutUseCase.execute(dto.refreshToken);
  }
}
