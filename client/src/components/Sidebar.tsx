import dayjs from 'dayjs'

import { Sub } from '../types'
import { useAuthState } from '../context/auth'
import Link from 'next/link'

export default function Sidebar({ sub }: { sub: Sub }) {
  const { authenticated } = useAuthState()

  return (
    <div className="ml-6 w-80">
      <div className="bg-white rounded">
        <div className="p-3 bg-red-500 rounded-t">
          <p className="font-semibold text-white">Info Sub</p>
        </div>
        <div className="p-3">
          <p className="mb-3 text-md">{sub.description}</p>
          {/* <div className="flex mb-3 text-sm font-medium">
            <div className="w-1/2">
              <p>5.2k</p>
              <p>members</p>
            </div>
            <div className="w-1/2">
              <p>150</p>
              <p>online</p>
            </div>
          </div> */}
          <p className="my-3">
            <i className="mr-2 fas fa-globe"></i>
            Sejak {dayjs(sub.createdAt).format('D MMM YYYY')}
          </p>
          {authenticated && (
            <Link href={`/d/${sub.name}/submit`}>
              <a className="w-full py-1 text-sm blue button">Bikin Post</a>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
