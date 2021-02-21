import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Image from 'next/image'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import classNames from 'classnames'

import { Post, Comment } from '../../../../types'
import Sidebar from '../../../../components/Sidebar'
import Axios from 'axios'
import { useAuthState } from '../../../../context/auth'
import ActionButton from '../../../../components/ActionButton'
import { FormEvent, useState, useEffect } from 'react'
import Embed from 'react-embed'
import { BrowserView } from 'react-device-detect'
import dynamic from 'next/dynamic'
import gfm from 'remark-gfm'

const ValineComment = dynamic(
  () => import('../../../../components/ValineComment'),
  {
    ssr: false,
  },
)
const ReactMarkdownWithHtml = dynamic(
  () => import('react-markdown/with-html'),
  {
    ssr: false,
  },
)
const id = require('dayjs/locale/id')
dayjs.extend(relativeTime)
dayjs.locale(id)

export default function PostPage() {
  // Local state
  const [newComment, setNewComment] = useState('')
  const [commentembed, setCommentembed] = useState('')
  const [errors, setErrors] = useState<any>({})
  // Global state
  const { authenticated, user } = useAuthState()
  // Utils
  const router = useRouter()
  const { identifier, sub, slug } = router.query

  const { data: post, error } = useSWR<Post>(
    identifier && slug ? `/posts/${identifier}/${slug}` : null,
  )

  const { data: comments, revalidate } = useSWR<Comment[]>(
    identifier && slug ? `/posts/${identifier}/${slug}/comments` : null,
  )

  if (error) router.push('/')

  const vote = async (value: number, comment?: Comment) => {
    // If not logged in go to login
    if (!authenticated) router.push('/login')

    // If vote is the same reset vote
    if (
      (!comment && value === post.userVote) ||
      (comment && comment.userVote === value)
    )
      value = 0

    try {
      await Axios.post('/misc/vote', {
        identifier,
        slug,
        commentIdentifier: comment?.identifier,
        value,
      })

      revalidate()
    } catch (err) {
      console.log(err)
    }
  }

  const submitComment = async (event: FormEvent) => {
    event.preventDefault()
    if (newComment.trim() === '') return

    try {
      await Axios.post(`/posts/${post.identifier}/${post.slug}/comments`, {
        body: newComment,
        embed: commentembed,
      })

      setNewComment('')
      setCommentembed('')
      revalidate()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <>
      <Head>
        <title>{post?.title}</title>
      </Head>
      <div className="container flex lg:pt-5 xl:pt-5">
        {/* Post */}
        <div className="w-160">
          <div className="bg-white lg:rounded xl:rounded">
            {post && (
              <>
                <div className="flex">
                  {/* Vote section */}
                  <div className="flex-shrink-0 w-10 py-2 text-center rounded-l">
                    {/* Upvote */}
                    <div
                      className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
                      onClick={() => vote(1)}
                    >
                      <i
                        className={classNames('icon-arrow-up', {
                          'text-red-500': post.userVote === 1,
                        })}
                      ></i>
                    </div>
                    <p className="text-xs font-bold">{post.voteScore}</p>
                    {/* Downvote */}
                    <div
                      className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-600"
                      onClick={() => vote(-1)}
                    >
                      <i
                        className={classNames('icon-arrow-down', {
                          'text-blue-600': post.userVote === -1,
                        })}
                      ></i>
                    </div>
                  </div>
                  <div className="w-full py-2 pr-2">
                    <div className="flex items-center">
                      <p className="text-xs text-gray-500">
                        Diposting oleh
                        <Link href={`/u/${post.username}`}>
                          <a className="mx-1 hover:underline">
                            {post.username}
                          </a>
                        </Link>
                        <Link href={post.url}>
                          <a className="mx-1 hover:underline">
                            {dayjs(post.createdAt).fromNow()}
                          </a>
                        </Link>
                      </p>
                    </div>
                    <Link href={`/d/${sub}`}>
                      <a className=" mx-1 ml-2 font-bold hover:cursor-pointer text-xs text-blue-400">
                        /d/{sub}
                      </a>
                    </Link>
                  </div>
                </div>
                {/* Comment input area */}
                <h1 className="pl-2 text-xl pb-2 font-bold">{post.title}</h1>
                {post.embed ? (
                  post.embed.includes('twitter.com') ||
                  post.embed.includes('instagram.com') ||
                  post.embed.includes('youtube.com') ||
                  post.embed.includes('imgur.com') ? (
                    <div className="object-cover w-full pl-3 pr-3">
                      <Embed width={200} url={post.embed} />{' '}
                    </div>
                  ) : (
                    <img className="object-cover w-full" src={post.embed} />
                  )
                ) : (
                  <div />
                )}

                {/* Post body */}
                <article className="prose pt-3 pr-3 pl-3 container mx-auto">
                  <ReactMarkdownWithHtml
                    plugins={[gfm]}
                    source={post.body}
                    allowDangerousHtml
                  />
                </article>
                <hr />
                {/* Comments feed */}
                <article className="prose pt-3 pr-3 pl-3 container mx-auto">
                  <ReactMarkdownWithHtml
                    plugins={[gfm]}
                    source={
                      'Komentar bisa pake markdown, **Belajar Markdown** di link [ini!](https://guides.github.com/features/mastering-markdown/)'
                    }
                    allowDangerousHtml
                  />
                </article>
                <div className="pl-3 pr-3 pt-3 mx-auto">
                  <ValineComment id={`/${identifier}/${slug}`} />
                </div>
              </>
            )}
          </div>
        </div>
        {/* Sidebar */}
        <BrowserView>{post && <Sidebar sub={post.sub} />}</BrowserView>
      </div>
    </>
  )
}
