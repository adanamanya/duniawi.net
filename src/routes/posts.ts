import { Router, Request, Response } from 'express'
import Comment from '../entities/Comment'
import Post from '../entities/Post'
import Sub from '../entities/Sub'
import { isEmpty } from 'class-validator'
import { getRepository } from 'typeorm'
import Vote from '../entities/Vote'
import auth from '../middleware/auth'
import user from '../middleware/user'

const createPost = async (req: Request, res: Response) => {
  const { title, embed, body, sub, nsfw } = req.body

  const user = res.locals.user

  if (title.trim() === '') {
    return res.status(400).json({ title: 'Title must not be empty' })
  }

  try {
    // find sub
    const subRecord = await Sub.findOneOrFail({ name: sub })

    const post = new Post({ title, embed, body, user, nsfw, sub: subRecord })
    await post.save()

    return res.json(post)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

const getPosts = async (req: Request, res: Response) => {
  const currentPage: number = (req.query.page || 0) as number
  const postsPerPage: number = (req.query.count || 8) as number

  try {
    const posts = await Post.find({
      order: { createdAt: 'DESC' },
      relations: ['comments', 'votes', 'sub'],
      skip: currentPage * postsPerPage,
      take: postsPerPage,
    })

    if (res.locals.user) {
      posts.forEach((p) => p.setUserVote(res.locals.user))
    }

    return res.json(posts)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Something went wrong', err })
  }
}

const getPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params
  try {
    const post = await Post.findOneOrFail(
      { identifier, slug },
      { relations: ['sub', 'votes', 'comments'] }
    )

    if (res.locals.user) {
      post.setUserVote(res.locals.user)
    }

    return res.json(post)
  } catch (err) {
    console.log(err)
    return res.status(404).json({ error: 'Post not found' })
  }
}

const commentOnPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params
  const body = req.body.body
  const embed = req.body.embed

  try {
    const post = await Post.findOneOrFail({ identifier, slug })

    const comment = new Comment({
      body,
      embed,
      user: res.locals.user,
      post,
    })

    await comment.save()

    return res.json(comment)
  } catch (err) {
    console.log(err)
    return res.status(404).json({ error: 'Post not found' })
  }
}

const deletePost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params
  const user = res.locals.user
  let vote: Vote | undefined

  try {
    const post = await Post.findOneOrFail({ identifier, slug })
    vote = await Vote.findOne({ user, post })
    vote?.remove()
    await post.remove()
    return
  } catch (err) {
    console.log(err)
    return res.status(404).json({ error: 'Post not found' })
  }
}

const getPostComments = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params
  try {
    const post = await Post.findOneOrFail({ identifier, slug })

    const comments = await Comment.find({
      where: { post },
      order: { createdAt: 'DESC' },
      relations: ['votes'],
    })

    if (res.locals.user) {
      comments.forEach((c) => c.setUserVote(res.locals.user))
    }

    return res.json(comments)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Something went wrong' })
  }
}

//WIP
const searchPosts = async (req: Request, res: Response) => {
  try {
    const title = req.params.name

    if (isEmpty(title)) {
      return res.status(400).json({ error: 'Name must not be empty' })
    }

    const posts = await getRepository(Post)
      .createQueryBuilder()
      .where('LOWER(title) LIKE :name', {
        name: `${title.toLowerCase().trim()}%`,
      })
      .getMany()

    return res.json(posts)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: 'Something went wrong' })
  }
}
const router = Router()

router.post('/', user, auth, createPost)
router.get('/', user, getPosts)
router.get('/:identifier/:slug', user, getPost)
router.post('/:identifier/:slug/comments', user, auth, commentOnPost)
router.delete('/:identifier/:slug/deletepost', user, auth, deletePost)
router.get('/:identifier/:slug/comments', user, getPostComments)

export default router
