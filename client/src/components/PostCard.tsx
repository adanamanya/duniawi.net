import Link from 'next/link'
import Axios from 'axios'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import classNames from 'classnames'
import { useState, useEffect, useRef } from 'react'
import { Post } from '../types'
import ActionButton from './ActionButton'
import { useAuthState } from '../context/auth'
import { useRouter } from 'next/router'
import Embed from 'react-embed'
import Popup from 'reactjs-popup'
import 'reactjs-popup/dist/index.css'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
const id = require('dayjs/locale/id')
dayjs.extend(relativeTime)
dayjs.locale(id)
interface PostCardProps {
  post: Post
  ownSub: boolean
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
    username,
  },
  ownSub,
  revalidate,
}: PostCardProps) {
  const { authenticated, user } = useAuthState()
  const router = useRouter()
  const [ownPost, setOwnPost] = useState(false)
  const ref = useRef()
  // console.log(ownSub, 'eheheheh')
  useEffect(() => {
    if (!title) return
    setOwnPost(authenticated && user.username === username)
  }, [title])
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

      // console.log(res.data)
    } catch (err) {
      console.log(err)
    }
  }
  const deletePost = async (ref) => {
    try {
      Axios.delete(`/posts/${identifier}/${slug}/deletepost`)
      ref.current.close()
      toast.dark('🚀 Menghapus jejakmu...', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      window.location.reload()
    } catch (err) {
      console.log(err)
    }
    // if (revalidate) revalidate()
  }
  return (
    <div
      key={identifier}
      className="flex mb-4 bg-white rounded"
      id={identifier}
    >
      <ToastContainer />

      {/* Vote section */}
      <div className="w-10 py-3 text-center bg-gray-100 rounded-l">
        {/* Upvote */}
        <div
          className="pt-3 w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
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
        <a href={url} rel="noopener noreferrer prev">
          <a className="my-1 text-lg font-medium">{title}</a>
        </a>
        <div>
          {embed ? (
            embed.includes('https://twitter.com') ||
            embed.includes('https://instagram.com') ||
            embed.includes('https://www.youtube.com') ||
            embed.includes('https://imgur.com') ? (
              <div className="flex w-11/12 md:w-auto lg:w-auto xl:w-auto">
              <Embed url={embed} /></div>
            ) : (
              <img src={embed} />
            )
          ) : (
            <div />
          )}
        </div>
        {ownPost || ownSub ? (
          <div className="flex">
            <Popup
              ref={ref}
              trigger={
                <a>
                  {' '}
                  <ActionButton>
                    <i className="mr-1 fas fa-trash fa-xs"></i>
                    <span className="font-bold">hapus postingan</span>
                  </ActionButton>
                </a>
              }
              position="right center"
            >
              {(close) => (
                <div>
                  <p>Mau dihapus ??</p>
                  <a className="p-3">
                    <button
                      onClick={() => deletePost(ref)}
                      className="mr-5 p-1 my-3 bg-blue-500 text-white rounded-md focus:outline-none focus:ring-2 ring-blue-300 ring-offset-2"
                    >
                      Iya
                    </button>
                    <button
                      onClick={close}
                      className="p-1 my-2 bg-red-500 text-white rounded-md focus:outline-none focus:ring-2 ring-red-300 ring-offset-2"
                    >
                      Nggak
                    </button>
                  </a>
                </div>
              )}
            </Popup>
          </div>
        ) : null}
      </div>
    </div>
  )
}
