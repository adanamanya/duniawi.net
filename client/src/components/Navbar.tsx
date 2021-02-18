import Axios from 'axios'
import Link from 'next/link'
import { Fragment, useEffect, useState } from 'react'
import Image from 'next/image'

import { useAuthState } from '../context/auth'
import gravatar from 'gravatar'
import HomeLogo from '../images/home.svg'
// import RedditLogo from '../images/reddit.svg'
import { Sub } from '../types'
import { useRouter } from 'next/router'
import { BrowserView, MobileView } from 'react-device-detect'

const Navbar: React.FC = () => {
  const [name, setName] = useState('')
  const [subs, setSubs] = useState<Sub[]>([])
  const [timer, setTimer] = useState(null)
  const { authenticated, user, loading } = useAuthState()

  const router = useRouter()

  useEffect(() => {
    if (name.trim() === '') {
      setSubs([])
      return
    }
    searchSubs()
  }, [name])


  const searchSubs = async () => {
    clearTimeout(timer)
    setTimer(
      setTimeout(async () => {
        try {
          const { data } = await Axios.get(`/subs/search/${name}`)
          setSubs(data)
        } catch (err) {
          console.log(err)
        }
      }, 250)
    )
  }

  const goToSub = (subName: string) => {
    router.push(`/d/${subName}`)
    setName('')
  }

  return (
    <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between h-12 px-5 bg-white">
      {/* Logo and title */}
      <div className="flex items-center">
        {/* <Link href="/">
          <a>
            <RedditLogo className="w-8 h-8 mr-2" />
          </a>
        </Link> */}
        <Link href="/">
          <a>
            <HomeLogo className="w-8 h-8 mr-2" />
          </a>
        </Link>
        <span className="hidden text-2xl font-semibold lg:block">
          <Link href="/">duniawi</Link>
        </span>
        {/* <MobileView>
         <Link href="/">
          <a>
            <HomeLogo className="w-8 h-8 mr-2" />
          </a>
        </Link>
        </MobileView> */}
      </div>
      {/* Serach Input */}
      <div className="max-w-full px-4 w-50 md:w-160 xl:w-160 lg:w-160">
        <div className="relative flex items-center bg-gray-100 border rounded cursor-pointer hover:border-blue-500 hover:bg-white">
          <i className="pl-4 pr-3 text-gray-500 fas fa-search "></i>
          <input
            type="text"
            className="py-1 pr-3 bg-transparent rounded focus:outline-none"
            placeholder="Cari sub"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div
            className="absolute left-0 right-0 bg-white"
            style={{ top: '100%' }}
          >
            {subs?.map((sub) => (
              <div
                className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-200"
                onClick={() => goToSub(sub.name)}
              >
                <Image
                  src={sub.imageUrl}
                  className="rounded-full"
                  alt="Sub"
                  height={(8 * 16) / 4}
                  width={(8 * 16) / 4}
                />
                <div className="ml-4 text-sm">
                  <p className="font-medium">{sub.name}</p>
                  <p className="text-gray-600">{sub.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      {/* Auth buttons */}
      <div className="flex">
        {!loading &&
          (authenticated ? (
           <div>
            <BrowserView>
            <Link href={`/u/${user.username}`}>
            <a
            className="hidden w-20 py-1 mr-4 leading-5 sm:block lg:w-32 hollow blue button"
            >
            {user.username}
            </a>
            </Link>
            </BrowserView>
            <MobileView>
             <Link href={`/u/${user.username}`}>
             <a>
               <img
                 src={gravatar.url(user.email,{s: '200', d: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'})}
                 className="rounded-full cursor-pointer"
                 alt="Akun saya"
                 width={(6 * 16) / 3}
                 height={(6 * 16) / 3}
               />
             </a>
              </Link>
           </MobileView>
          </div>
          ) : (
            <Fragment>
              <Link href="/login">
                <a className="hidden w-20 py-1 mr-4 leading-5 sm:block lg:w-32 hollow blue button">
                  log in
                </a>
              </Link>
              <Link href="/register">
                <a className="hidden w-20 py-1 leading-5 sm:block lg:w-32 blue button">
                  sign up
                </a>
              </Link>
            </Fragment>
          ))}
      </div>
    </div>
  )
}

export default Navbar
