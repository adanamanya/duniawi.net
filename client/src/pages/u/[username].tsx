import Axios from 'axios'
import dayjs from 'dayjs'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import PostCard from '../../components/PostCard'
import { Post, Comment } from '../../types'
import { useAuthState, useAuthDispatch } from '../../context/auth'
import gravatar from 'gravatar'
export default function user() {
  const router = useRouter()
  const username = router.query.username
  const { authenticated, user } = useAuthState()
  const dispatch = useAuthDispatch()
  const logout = () => {
    Axios.get('/auth/logout')
      .then(() => {
        dispatch('LOGOUT')
        window.location.reload()
      })
      .catch((err) => console.log(err))
  }
  const { data, error } = useSWR<any>(username ? `/users/${username}` : null)
  if (error) router.push('/')

  if (data) console.log(data)

  return (
    <>
      <Head>
        <title>{data?.user.username}</title>
      </Head>
      {data && (
        <div className="container md:flex lg:flex xl:flex pt-5">
          <div className="mb-5 mx-auto w-80 visible xl:invisible lg:invisible md:invisible">
            <div className="bg-white rounded">
              <div className="p-3 bg-gray-500 rounded-t">
                <img
                  src={gravatar.url(data.user.email, {
                    s: '200',
                    d:
                      'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
                  })}
                  alt="user profile"
                  className="w-32 h-32 mx-auto rounded-full"
                />
              </div>
              <div className="p-3 text-center">
                <h1 className="mb-3 text-xl">{data.user.username}</h1>
                <hr />
                <p className="mt-3 pb-3">
                  Join {dayjs(data.user.createdAt).format('MMM YYYY')}
                </p>
                {authenticated && user.username == username && (
                  <div>
                    <hr />
                    <div className="border-t-2 mx-auto w-25 p-2 py-3 sm:block">
                      <a
                        href="https://id.gravatar.com"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <p className=" p-2 my-2 bg-red-500 text-white rounded-md focus:outline-none focus:ring-2 ring-red-300 ring-offset-2">Ubah avatar</p>
                      </a>
                    </div>
                    <br />
                    <button
                      className="pt:10 mx-auto w-20 py-1 leading-5 sm:block lg:w-32 hollow blue button"
                      onClick={logout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="md:w-160">
            {data.submissions.map((submission: any) => {
              if (submission.type === 'Post') {
                const post: Post = submission
                return <PostCard key={post.identifier} post={post} />
              } else {
                const comment: Comment = submission
                return (
                  <div
                    key={comment.identifier}
                    className="flex my-4 bg-white rounded"
                  >
                    <div className="flex-shrink-0 w-10 py-4 text-center bg-gray-200 rounded-l">
                      <i className="text-gray-500 fas fa-comment-alt fa-xs"></i>
                    </div>
                    <div className="w-full p-2">
                      <p className="mb-2 text-xs text-gray-500">
                        {comment.username}

                        <span> commented on </span>
                        <Link href={comment.post.url}>
                          <a className="font-semibold cursor-pointer hover:underline">
                            {comment.post.title}
                          </a>
                        </Link>
                        <span className="mx-1">•</span>
                        <Link href={`/r/${comment.post.subName}`}>
                          <a className="text-black cursor-pointer hover:underline">
                            /r/{comment.post.subName}
                          </a>
                        </Link>
                      </p>
                      <hr />
                      <p>{comment.body}</p>
                    </div>
                  </div>
                )
              }
            })}
          </div>
          <div className="ml-4 w-80 invisible xl:visible lg:visible md:visible">
            <div className="bg-white rounded">
              <div className="p-3 bg-gray-500 rounded-t">
                <img
                  src={gravatar.url(data.user.email, {
                    s: '200',
                    d:
                      'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
                  })}
                  alt="user profile"
                  className="w-32 h-32 mx-auto rounded-full"
                />
              </div>
              <div className="p-3 text-center">
                <h1 className="mb-3 text-xl">{data.user.username}</h1>
                <hr />
                <p className="mt-3 pb-3">
                  Join {dayjs(data.user.createdAt).format('MMM YYYY')}
                </p>
                {authenticated && user.username == username && (
                  <div>
                    <hr />
                    <div className="border-t-2 mx-auto w-25 p-2 py-3 sm:block">
                      <a
                        href="https://id.gravatar.com"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <p className=" p-2 my-2 bg-red-500 text-white rounded-md focus:outline-none focus:ring-2 ring-red-300 ring-offset-2">Ubah avatar</p>
                      </a>
                    </div>
                    <br />
                    <button
                      className="hidden pt:10 mx-auto w-20 py-1 leading-5 sm:block lg:w-32 hollow blue button"
                      onClick={logout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
