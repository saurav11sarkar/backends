import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import buildWhereConditions from '../../helper/buildWhereConditions';
import paginationHelper, { IOptions } from '../../helper/pagenation';
import { IFilterParams } from '../../helper/pick';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService {
  constructor(public readonly prisma: PrismaService) {}

  async addNewBook(dto: CreateBookDto) {
    const book = await this.prisma.book.findFirst({
      where: { title: dto.title },
    });
    if (book)
      throw new HttpException('Book already exists', HttpStatus.CONFLICT);

    if (
      !Number.isInteger(dto.publishedYear) ||
      dto.publishedYear < 1900 ||
      dto.publishedYear > new Date().getFullYear()
    ) {
      throw new HttpException(
        'Published year must be between 1900 and the current year',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.prisma.book.create({
      data: {
        title: dto.title,
        author: dto.author,
        category: dto.category,
        publishedYear: dto.publishedYear,
      },
    });
    return result;
  }

  async getAllBookes(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const whereCondition = buildWhereConditions(params, ['title', 'author']);

    const result = await this.prisma.book.findMany({
      where: whereCondition,
      take: limit,
      skip,
      orderBy: { [sortBy]: sortOrder },
    });

    const total = await this.prisma.book.count({ where: whereCondition });

    return {
      data: result,
      meta: { page, limit, total },
    };
  }

  async getSingleBook(id: string) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
    return book;
  }

  async updateBook(id: string, dto: UpdateBookDto) {
    const book = await this.getSingleBook(id);
    if (book.isBorrowed)
      throw new HttpException('Book is borrowed', HttpStatus.CONFLICT);

    const existingBook = await this.prisma.book.findFirst({
      where: {
        title: dto.title,
        id: { not: id },
      },
    });
    if (existingBook)
      throw new HttpException(
        'Another book with this title already exists',
        HttpStatus.CONFLICT,
      );

    if (
      !Number.isInteger(dto.publishedYear) ||
      dto.publishedYear < 1900 ||
      dto.publishedYear > new Date().getFullYear()
    )
      throw new HttpException(
        'Published year must be between 1900 and the current year',
        HttpStatus.BAD_REQUEST,
      );

    const result = await this.prisma.book.update({
      where: { id: book.id },
      data: dto,
    });
    return result;
  }

  async borrowBook(id: string, dto: BorrowBookDto) {
    const book = await this.getSingleBook(id);
    if (book.isBorrowed)
      throw new HttpException('Book is already borrowed', HttpStatus.CONFLICT);

    const result = await this.prisma.book.update({
      where: { id: book.id },
      data: { isBorrowed: true, borrowerName: dto.borrowerName },
    });
    return result;
  }

  async returnBook(id: string) {
    const book = await this.getSingleBook(id);
    if (!book.isBorrowed)
      throw new HttpException('Book is not borrowed', HttpStatus.CONFLICT);

    const result = await this.prisma.book.update({
      where: { id: book.id },
      data: { isBorrowed: false, borrowerName: null },
    });
    return result;
  }

  async deleteBook(id: string) {
    const book = await this.getSingleBook(id);
    if (book.isBorrowed)
      throw new HttpException('Book is borrowed', HttpStatus.CONFLICT);

    const result = await this.prisma.book.delete({
      where: { id: book.id },
    });
    return result;
  }
}
