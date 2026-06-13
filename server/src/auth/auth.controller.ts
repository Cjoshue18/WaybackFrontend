import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { RegisterClienteDto } from './dto/register-cliente.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-cliente')
  async registerCliente(@Body() dto: RegisterClienteDto) {
    try {
      const result = await this.authService.registerCliente(dto);
      return { success: true, ...result };
    } catch (err: any) {
      throw new BadRequestException(err?.message ?? 'Error al registrar cliente');
    }
  }
}
