import { IsNotEmpty, IsString, IsOptional, IsEnum, IsUUID, IsArray } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsEnum(['OPEN', 'IN_PROGRESS', 'DONE'])
  status?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
