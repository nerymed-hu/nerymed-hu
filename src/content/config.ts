import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    description: z.string().optional(),
    author: z.string().default('Dr. Nery Klaudia Krisztina'),
    image: z.string().optional(),
  }),
});

export const collections = { blog };
