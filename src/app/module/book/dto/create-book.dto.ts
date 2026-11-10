import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    example: 'The Alchemist',
    description: 'Book title',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'Paulo Coelho',
    description: 'Author name',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  author!: string;

  @ApiProperty({
    example: 'Fiction',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({
    example: 1988,
    minimum: 1900,
    maximum: new Date().getFullYear(),
  })
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  publishedYear!: number;
}
