import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import pick from '../../helper/pick';
import { BookService } from './book.service';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@ApiTags('Book')
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new book' })
  @HttpCode(HttpStatus.CREATED)
  async addNewBook(@Body() dto: CreateBookDto) {
    const result = await this.bookService.addNewBook(dto);
    return { message: 'Book created successfully', data: result };
  }


  @Get()
  @ApiOperation({ summary: 'Get all books' })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'title',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'author',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
  })
  @HttpCode(HttpStatus.OK)
  async getAllBookes(@Req() req: Request) {
    const filters = pick(req.query, [
      'searchTerm',
      'title',
      'author',
      'category',
    ]);
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const result = await this.bookService.getAllBookes(filters, options);
    return {
      message: 'Books retrieved successfully',
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single book' })
  @HttpCode(HttpStatus.OK)
  async getSingleBook(@Param('id') id: string) {
    const result = await this.bookService.getSingleBook(id);
    return { message: 'Book retrieved successfully', data: result };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update book details' })
  @HttpCode(HttpStatus.OK)
  async updateBook(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    const result = await this.bookService.updateBook(id, dto);
    return { message: 'Book updated successfully', data: result };
  }

  @Post(':id/borrow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Borrow an available book' })
  async borrowBook(@Param('id') id: string, @Body() dto: BorrowBookDto) {
    const result = await this.bookService.borrowBook(id, dto);
    return { message: 'Book borrowed successfully', data: result };
  }

  @Post(':id/return')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Return a borrowed book' })
  async returnBook(@Param('id') id: string) {
    const result = await this.bookService.returnBook(id);
    return { message: 'Book returned successfully', data: result };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an available book' })
  async deleteBook(@Param('id') id: string) {
    await this.bookService.deleteBook(id);
    return { message: 'Book deleted successfully', data: null };
  }
}
