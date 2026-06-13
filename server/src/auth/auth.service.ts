import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { RegisterClienteDto } from './dto/register-cliente.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async registerCliente(dto: RegisterClienteDto): Promise<{ usu_id: number }> {
    // El frontend manda el email en UsuUsernameOrEmail
    const email = dto.UsuUsernameOrEmail?.trim().toLowerCase();
    if (!email) throw new BadRequestException('Email es obligatorio');

    const rawPassword = dto.UsuContrasena;
    if (!rawPassword || rawPassword.length < 6) {
      throw new BadRequestException('Contraseña inválida (mínimo 6 caracteres)');
    }

    let username = email.split('@')[0] || 'user';

    const ensureUniqueUsername = async (base: string) => {
      let candidate = base;
      let counter = 0;
      while (counter < 100) {
        const existing = await this.prisma.usuarios.findFirst({ where: { usu_username: candidate }, select: { usu_id: true } });
        if (!existing) return candidate;
        counter += 1;
        candidate = `${base}${Math.floor(Math.random() * 9000) + 1000}`;
      }
      throw new ConflictException('No se pudo generar un username único');
    };

    username = await ensureUniqueUsername(username.toLowerCase());

    const existingByEmail = await this.prisma.usuarios.findFirst({ where: { usu_email: email }, select: { usu_id: true } });
    if (existingByEmail) {
      throw new BadRequestException('Ya existe una cuenta con ese email');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(rawPassword, saltRounds);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const createdUser = await tx.usuarios.create({
          data: {
            usu_email: email,
            usu_username: username,
            usu_password_hash: passwordHash,
            usu_rol: 'client',
          },
          select: { usu_id: true, usu_email: true },
        });

        const createdCliente = await tx.clientes.create({
          data: {
            cli_nombre: dto.cli_nombre,
            cli_apellido: dto.cli_apellido,
            cli_email: email,
            cli_documento_tipo: dto.cli_documento_tipo,
            cli_documento: dto.cli_documento,
            cli_telefono: dto.cli_telefono ?? null,
            usu_id: createdUser.usu_id,
          },
          select: { cliente_id: true },
        });

        return { usu_id: createdUser.usu_id, cliente_id: createdCliente.cliente_id };
      }, { isolationLevel: 'ReadCommitted' });

      return { usu_id: result.usu_id };
    } catch (error: any) {
      const msg =
        error?.meta?.target?.includes('usu_username') || error?.message?.includes('unique')
          ? 'Nombre de usuario o email duplicado'
          : error?.message ?? 'Error interno al crear usuario/cliente';
      throw new BadRequestException(msg);
    }
  }
}
