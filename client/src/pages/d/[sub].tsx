import Head from 'next/head'
import { useRouter } from 'next/router'
import { ChangeEvent, createRef, Fragment, useEffect, useState } from 'react'
import useSWR from 'swr'
import PostCard from '../../components/PostCard'
import Image from 'next/image'
import classNames from 'classnames'
import dayjs from 'dayjs'
import Link from 'next/link'
import { BrowserView } from 'react-device-detect'
import { Sub } from '../../types'
import { useAuthState } from '../../context/auth'
import Axios from 'axios'
import Sidebar from '../../components/Sidebar'

export default function SubPage() {
  // Local state
  const [ownSub, setOwnSub] = useState(false)
  // Global state
  const { authenticated, user } = useAuthState()
  // Utils
  const router = useRouter()
  const fileInputRef = createRef<HTMLInputElement>()

  const subName = router.query.sub
  const slugpage = router.pathname.includes('/d/') ? true : false
  const { data: sub, error, revalidate } = useSWR<Sub>(
    subName ? `/subs/${subName}` : null,
  )

  useEffect(() => {
    if (!sub) return
    setOwnSub(authenticated && user.username === sub.username)
  }, [sub])

  const openFileInput = (type: string) => {
    if (!ownSub) return
    fileInputRef.current.name = type
    fileInputRef.current.click()
  }

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0]

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', fileInputRef.current.name)

    try {
      await Axios.post<Sub>(`/subs/${sub.name}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      revalidate()
    } catch (err) {
      console.log(err)
    }
  }

  if (error) router.push('/')
  let postsMarkup
  if (!sub) {
    postsMarkup = <p className="text-lg text-center">Loading..</p>
  } else if (sub.posts.length === 0) {
    postsMarkup = (
      <p className="text-lg text-center">Belum ada post samsek...</p>
    )
  } else {
    postsMarkup = sub.posts.map((post) =>
      slugpage && !sub.nsfw && post.nsfw ? (
        <div className="filter filter-blur-5">
          {' '}
          <PostCard key={post.identifier} post={post} />
        </div>
      ) : (
        <PostCard key={post.identifier} post={post} />
      ),
    )
  }

  return (
    <div className="overflow-hidden">
      <Head>
        <title>{sub?.title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      {sub && (
        <Fragment>
          <input
            type="file"
            hidden={true}
            ref={fileInputRef}
            onChange={uploadImage}
          />
          {/* Sub info and images */}
          <div>
            {/* Banner image */}
            <div
              className={classNames('bg-red-500', {
                'cursor-pointer': ownSub,
              })}
              onClick={() => openFileInput('banner')}
            >
              {sub.bannerUrl ? (
                <div
                  className="h-40 md:h-56 lg:h-56 xl:h-56 bg-black"
                  style={{
                    backgroundImage: `url(${sub.bannerUrl})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                ></div>
              ) : (
                <div className="h-20 bg-red-500"></div>
              )}
            </div>
            {/* Sub meta data */}
            <div className="h-40 lg:h-20 xl:h-20 md:h-20 bg-white">
              <div className="container relative flex">
                <div className="absolute" style={{ top: -15 }}>
                  <Image
                    src={sub.imageUrl}
                    alt="Sub"
                    className={classNames('rounded-full', {
                      'cursor-pointer': ownSub,
                    })}
                    onClick={() => openFileInput('image')}
                    width={90}
                    height={90}
                  />
                </div>
                <div className="pt-1 pl-24">
                  <div className="flex items-center">
                    <h1 className="mb-1 text-3xl font-bold">{sub.title}</h1>
                  </div>
                  <p className="text-sm font-bold text-gray-500">
                    /d/{sub.name}
                  </p>
                  <p className="visible lg:invisible md:invisible xl:invisible text-sm font-bold text-gray-500">
                    Sejak {dayjs(sub.createdAt).format('D MMM YYYY')}
                  </p>
                  <p className="visible lg:invisible md:invisible xl:invisible text-sm text-gray-500 pb-2">
                    {sub.description}
                  </p>
                  {authenticated ? (
                    <div>
                      <Link href={`/d/${sub.name}/submit`}>
                        <a className="visible lg:invisible md:invisible xl:invisible w-full py-1 text-sm blue button">
                          Buat Post
                        </a>
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <Link href="/login">
                        <a className="visible lg:invisible md:invisible xl:invisible w-full py-1 mr-4 leading-5 sm:block lg:w-32 hollow blue button">
                          log in untuk post
                        </a>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Posts & Sidebar */}
          <div className="container flex pt-5">
            <div className="w-full">{postsMarkup}</div>
            <BrowserView>
              {' '}
              <Sidebar sub={sub} />
            </BrowserView>
          </div>
        </Fragment>
      )}
    </div>
  )
}
