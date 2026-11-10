import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});
const samples = [
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    category: 'Fiction',
    publishedYear: 1988,
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Programming',
    publishedYear: 2008,
  },
  {
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    category: 'Science',
    publishedYear: 1988,
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    category: 'History',
    publishedYear: 2011,
  },
  {
    title: 'The Hobbit',
    author: 'J. R. R. Tolkien',
    category: 'Fiction',
    publishedYear: 1937,
  },
  {
    title: '1984',
    author: 'George Orwell',
    category: 'Fiction',
    publishedYear: 1949,
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt and David Thomas',
    category: 'Programming',
    publishedYear: 1999,
  },
  {
    title: 'Cosmos',
    author: 'Carl Sagan',
    category: 'Science',
    publishedYear: 1980,
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self-help',
    publishedYear: 2018,
  },
  {
    title: 'The Guns of August',
    author: 'Barbara W. Tuchman',
    category: 'History',
    publishedYear: 1962,
  },
];

async function main() {
  for (const sample of samples) {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.book.findFirst({
        where: { title: sample.title, author: sample.author },
      });
      if (!existing) await tx.book.create({ data: sample });
    });
  }
  console.log('Sample books seeded successfully');
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
