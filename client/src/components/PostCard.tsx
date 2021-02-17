import Link from 'next/link'
import Axios from 'axios'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import classNames from 'classnames'

import { Post } from '../types'
import ActionButton from './ActionButton'
import { useAuthState } from '../context/auth'
import { useRouter } from 'next/router'
import Embed from 'react-embed'

const id = require('dayjs/locale/id')
dayjs.extend(relativeTime)
dayjs.locale(id)
interface PostCardProps {
  post: Post
  revalidate?: Function
}

export default function PostCard({
  post: {
    identifier,
    slug,
    title,
    body,
    embed,
    subName,
    createdAt,
    voteScore,
    userVote,
    commentCount,
    url,
    sub,
    username,
  },
  revalidate,
}: PostCardProps) {
  const { authenticated } = useAuthState()
  const router = useRouter()
  const vote = async (value: number) => {
    if (!authenticated) router.push('/login')

    if (value === userVote) value = 0

    try {
      const res = await Axios.post('/misc/vote', {
        identifier,
        slug,
        value,
      })

      if (revalidate) revalidate()

      console.log(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div
      key={identifier}
      className="flex mb-4 bg-white rounded"
      id={identifier}
    >
      {/* Vote section */}
      <div className="w-10 text-center rounded-l">
        {/* Upvote */}
        <div
          className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
          onClick={() => vote(1)}
        >
          <i
            className={classNames('icon-arrow-up', {
              'text-red-500': userVote === 1,
            })}
          ></i>
        </div>
        <p className="text-xs font-bold">{voteScore}</p>
        {/* Downvote */}
        <div
          className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-600"
          onClick={() => vote(-1)}
        >
          <i
            className={classNames('icon-arrow-down', {
              'text-blue-600': userVote === -1,
            })}
          ></i>
        </div>
      </div>
      {/* Post data section */}
      <div className="w-full p-2">
        <div className="flex items-center">
          <Link href={`/d/${subName}`}>
            <a className="text-xs font-bold cursor-pointer hover:underline">
              /d/{subName}
            </a>
          </Link>
          <p className="text-xs text-gray-500">
            <span className="mx-1">•</span>
            <Link href={`/u/${username}`}>
              <a className="mx-1 hover:underline">{username}</a>
            </Link>
            <Link href={url}>
              <a className="mx-1 hover:underline">
                {dayjs(createdAt).fromNow()}
              </a>
            </Link>
          </p>
        </div>
        <a target="_blank" href={url} rel="noopener noreferrer prev">
          <a className="my-1 text-lg font-medium">{title}</a>
        </a>
        <div className="flex w-11/12 md:w-auto lg:w-auto xl:w-auto">
          {embed ? (
            embed.includes('twitter.com') ||
            embed.includes('instagram.com') ||
            embed.includes('youtube.com') ||
            embed.includes('imgur.com') ? (
              <Embed url={embed} />
            ) : (
              <img src={embed} />
            )
          ) : (
            <div />
          )}
        </div>

        {/* {body && <p className="my-1 text-sm">{body}</p>} */}
        <div className="flex">
          <Link href={url}>
            <a>
              <ActionButton>
                <i className="mr-1 fas fa-comment-alt fa-xs"></i>
                <span className="font-bold">{commentCount} komentar</span>
              </ActionButton>
            </a>
          </Link>
          {/* <ActionButton>
            <i className="mr-1 fas fa-share fa-xs"></i>
            <span className="font-bold">Share</span>
          </ActionButton>
          <ActionButton>
            <i className="mr-1 fas fa-bookmark fa-xs"></i>
            <span className="font-bold">Save</span>
          </ActionButton> */}
        </div>
      </div>
    </div>
  )
}
