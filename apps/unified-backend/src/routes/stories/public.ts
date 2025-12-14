import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { errorSchema, paginationSchema } from '../../schemas/common.js'

// Enums from Prisma schema
const storyStatusSchema = z.enum(['COMPLETED', 'ONGOING', 'HIATUS']).meta({
  description: 'Story publication status',
  example: 'ONGOING',
})

const storyTypeSchema = z.enum(['FANFICTION', 'ORIGINAL']).meta({
  description: 'Story type',
  example: 'ORIGINAL',
})

// Owner info (subset of user data for public view)
const ownerSchema = z.strictObject({
  id: z.number().meta({
    description: 'Owner user ID',
    example: 1,
  }),
  username: z.string().meta({
    description: 'Owner username',
    example: 'johndoe',
  }),
})

// Public story response schema (what we show to anonymous users)
const publicStorySchema = z.strictObject({
  id: z.string().meta({
    description: 'Story ID',
    example: 'clx1234567890',
  }),
  name: z.string().meta({
    description: 'Story name/title',
    example: 'My Epic Adventure',
  }),
  summary: z.string().nullable().meta({
    description: 'Story summary/description',
    example: 'A tale of heroes and dragons',
  }),
  owner: ownerSchema,
  status: storyStatusSchema,
  type: storyTypeSchema,
  coverColor: z.string().meta({
    description: 'Cover background color',
    example: '#000000',
  }),
  coverTextColor: z.string().meta({
    description: 'Cover text color',
    example: '#FFFFFF',
  }),
  coverFontFamily: z.string().meta({
    description: 'Cover font family',
    example: 'Georgia',
  }),
  pages: z.number().nullable().meta({
    description: 'Estimated page count',
    example: 120,
  }),
  createdAt: z.string().meta({
    description: 'Creation timestamp',
    example: '2025-12-05T12:00:00.000Z',
  }),
  updatedAt: z.string().meta({
    description: 'Last update timestamp',
    example: '2025-12-05T12:00:00.000Z',
  }),
})

// List query parameters
const listPublicStoriesQuerySchema = z.strictObject({
  page: z.coerce.number().int().positive().default(1).meta({
    description: 'Page number',
    example: 1,
  }),
  pageSize: z.coerce.number().int().positive().max(100).default(20).meta({
    description: 'Items per page (max 100)',
    example: 20,
  }),
  search: z.string().optional().meta({
    description: 'Search query (searches name and summary)',
    example: 'dragon',
  }),
  status: storyStatusSchema.optional().meta({
    description: 'Filter by story status',
  }),
  type: storyTypeSchema.optional().meta({
    description: 'Filter by story type',
  }),
  sortBy: z.enum(['recent', 'popular', 'title']).default('recent').meta({
    description: 'Sort order',
    example: 'recent',
  }),
})

// Path parameters
const storyIdParamSchema = z.strictObject({
  id: z.string().meta({
    description: 'Story ID',
    example: 'clx1234567890',
  }),
})

// Response schemas
const listPublicStoriesResponseSchema = z.strictObject({
  stories: z.array(publicStorySchema),
  pagination: paginationSchema,
})

const getPublicStoryResponseSchema = z.strictObject({
  story: publicStorySchema,
})

// Helper to format story for public response
function formatPublicStory(story: any) {
  return {
    id: story.id,
    name: story.name,
    summary: story.summary,
    owner: {
      id: story.owner.id,
      username: story.owner.username,
    },
    status: story.status,
    type: story.type,
    coverColor: story.coverColor,
    coverTextColor: story.coverTextColor,
    coverFontFamily: story.coverFontFamily,
    pages: story.pages,
    createdAt: story.createdAt.toISOString(),
    updatedAt: story.updatedAt.toISOString(),
  }
}

const publicStoriesRoutes: FastifyPluginAsyncZod = async (fastify) => {
  // GET /stories - Browse published stories (public, no auth)
  fastify.get(
    '/',
    {
      schema: {
        description: 'Browse published stories (public, no authentication required)',
        tags: ['stories'],
        querystring: listPublicStoriesQuerySchema,
        response: {
          200: listPublicStoriesResponseSchema,
          500: errorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { page, pageSize, search, status, type, sortBy } = request.query

        const skip = (page - 1) * pageSize

        // Build where clause - only show published stories
        const where: any = {
          published: true,
        }

        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { summary: { contains: search, mode: 'insensitive' } },
          ]
        }

        if (status) {
          where.status = status
        }

        if (type) {
          where.type = type
        }

        // Get total count
        const total = await prisma.story.count({ where })

        // Determine sort order
        let orderBy: any
        switch (sortBy) {
          case 'popular':
            // TODO: Add view count or popularity metric later
            orderBy = [{ pages: 'desc' }, { updatedAt: 'desc' }]
            break
          case 'title':
            orderBy = { name: 'asc' }
            break
          case 'recent':
          default:
            orderBy = { updatedAt: 'desc' }
            break
        }

        // Get stories with owner info
        const stories = await prisma.story.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
          include: {
            owner: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        })

        const totalPages = Math.ceil(total / pageSize)

        return {
          stories: stories.map(formatPublicStory),
          pagination: {
            page,
            pageSize,
            total,
            totalPages,
          },
        }
      } catch (error) {
        fastify.log.error({ error }, 'Failed to list public stories')
        return reply.status(500).send({ error: 'Failed to list stories' })
      }
    }
  )

  // GET /stories/:id - View single published story (public, no auth)
  fastify.get(
    '/:id',
    {
      schema: {
        description: 'View a single published story (public, no authentication required)',
        tags: ['stories'],
        params: storyIdParamSchema,
        response: {
          200: getPublicStoryResponseSchema,
          404: errorSchema,
          500: errorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params

        const story = await prisma.story.findFirst({
          where: {
            id,
            published: true, // Only show if published
          },
          include: {
            owner: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        })

        if (!story) {
          return reply.status(404).send({ error: 'Story not found' })
        }

        return {
          story: formatPublicStory(story),
        }
      } catch (error) {
        fastify.log.error({ error }, 'Failed to get public story')
        return reply.status(500).send({ error: 'Failed to get story' })
      }
    }
  )
}

export default publicStoriesRoutes
