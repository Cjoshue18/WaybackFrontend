import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO que acepta exactamente el payload enviado por el frontend:
 * {
 *  "cli_documento_tipo": string,
 *  "cli_documento": string,
 *  "cli_nombre": string,
 *  "cli_apellido": string,
 *  "UsuUsernameOrEmail": string,
 *  "UsuContrasena": string,
 *  "cli_telefono": string | null (opcional)
 * }
 */
export class RegisterClienteDto {
  @IsString()
  @Transform(({ value }) => (value ?? '').toString().trim())
  cli_documento_tipo!: string;

  @IsString()
  @Transform(({ value }) => (value ?? '').toString().trim())
  cli_documento!: string;

  @IsString()
  @Transform(({ value }) => (value ?? '').toString().trim())
  cli_nombre!: string;

  @IsString()
  @Transform(({ value }) => (value ?? '').toString().trim())
  cli_apellido!: string;

  // Frontend sends email in this key
  @IsEmail()
  @Transform(({ value }) => (value ?? '').toString().trim().toLowerCase())
  UsuUsernameOrEmail!: string;

  @IsString()
  @MinLength(6)
  @Transform(({ value }) => (value ?? '').toString())
  UsuContrasena!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value == null ? null : String(value).trim()))
  cli_telefono?: string | null;
}
