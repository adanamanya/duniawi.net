import Head from 'next/head'
import { Fragment, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import useSWR, { useSWRInfinite } from 'swr'
import Image from 'next/image'

import { Post, Sub } from '../types'

import PostCard from '../components/PostCard'
import Link from 'next/link'
import { useAuthState } from '../context/auth'

dayjs.extend(relativeTime)

export default function Home() {
  const [observedPost, setObservedPost] = useState('')

  // const { data: posts } = useSWR<Post[]>('/posts')
  const { data: topSubs } = useSWR<Sub[]>('/misc/top-subs')
  const noNsfwTopSubs = topSubs?.filter((s) => {
    return !s?.nsfw
  })
  const { authenticated } = useAuthState()

  const {
    data,
    error,
    mutate,
    size: page,
    setSize: setPage,
    isValidating,
    revalidate,
  } = useSWRInfinite<Post[]>((index) => `/posts?page=${index}`)

  const posts: Post[] = data ? [].concat(...data) : []
  const noNsfw = posts.filter((p) => {
    return !p?.nsfw
  })
  useEffect(() => {
    if (!posts || posts.length === 0) return

    const id = posts[posts.length - 1].identifier

    if (id !== observedPost) {
      setObservedPost(id)
      observeElement(document.getElementById(id))
    }
  }, [posts])

  const observeElement = (element: HTMLElement) => {
    if (!element) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting === true) {
          // console.log('Reached bottom of post')
          setPage(page + 1)
          observer.unobserve(element)
        }
      },
      { threshold: 1 },
    )
    observer.observe(element)
  }

  return (
    <Fragment>
      <Head>
        <title>duniawi</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="container flex pt-4 overflow-hidden">
        {/* Posts feed */}
        <div className="w-full">
          {isValidating && <p className="text-lg text-center">Loading..</p>}
          {noNsfw?.map((post) => (
            <PostCard
              ownSub={false}
              post={post}
              key={post.identifier}
              revalidate={revalidate}
            />
          ))}
          {isValidating && posts.length > 0 && (
            <p className="text-lg text-center">Loading More..</p>
          )}
        </div>
        {/* Sidebar */}
        <div className="hidden ml-6 md:block w-80">
          <div className="bg-white rounded">
            <div className="p-4 border-b-2">
              <p className="text-lg font-semibold text-center">
                Komunitas Teratas
              </p>
            </div>
            <div>
              {noNsfwTopSubs?.map((sub) => (
                <div
                  key={sub.name}
                  className="flex items-center px-4 py-2 text-xs"
                >
                  <Link href={`/d/${sub.name}`}>
                    <a>
                      <Image
                        src={sub.imageUrl}
                        className="rounded-full cursor-pointer"
                        alt="Sub"
                        width={(6 * 16) / 4}
                        height={(6 * 16) / 4}
                      />
                    </a>
                  </Link>
                  <Link href={`/d/${sub.name}`}>
                    <a className="ml-2 font-bold hover:cursor-pointer">
                      /d/{sub.name}
                    </a>
                  </Link>
                  <p className="ml-auto font-med">{sub.postCount}</p>
                </div>
              ))}
            </div>
            {authenticated && (
              <div className="p-4 border-t-2">
                <Link href="/subs/create">
                  <a className="w-full px-2 py-1 blue button">
                    Bikin Komunitas
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  )
}

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   try {
//     const res = await Axios.get('/posts')

//     return { props: { posts: res.data } }
//   } catch (err) {
//     return { props: { error: 'Something went wrong' } }
//   }
// }
