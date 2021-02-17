import Axios from 'axios'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'
import useSWR from 'swr'
import Sidebar from '../../../components/Sidebar'
import { Post, Sub } from '../../../types'
import { BrowserView } from 'react-device-detect'
export default function submit() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [embed, setEmbed] = useState('')
  const [nsfw, setNsfw] = useState(false)

  const router = useRouter()
  const { sub: subName } = router.query

  const { data: sub, error } = useSWR<Sub>(subName ? `/subs/${subName}` : null)
  if (error) router.push('/')

  const submitPost = async (event: FormEvent) => {
    event.preventDefault()

    if (title.trim() === '') return

    try {
      const { data: post } = await Axios.post<Post>('/posts', {
        title: title.trim(),
        embed,
        nsfw,
        body,
        sub: sub.name,
      })

      router.push(`/d/${sub.name}/${post.identifier}/${post.slug}`)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="container flex pt-5">
      <Head>
        <title>Posting</title>
      </Head>
      <div className="w-160">
        <div className="p-4 bg-white rounded">
          <h1 className="mb-3 text-lg">Post ke /d/{subName}</h1>
          <form onSubmit={submitPost}>
            <div className="relative mb-2">
              <input
                type="text"
                className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none"
                placeholder="Title"
                maxLength={300}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                type="text"
                className="w-full mt-3 px-3 py-2 border border-gray-300 rounded focus:outline-none"
                placeholder="Embed url (optional)"
                maxLength={300}
                value={embed}
                onChange={(e) => setEmbed(e.target.value)}
              />
              <div
                className="absolute mb-2 text-sm text-gray-500 select-none focus:border-gray-600"
                style={{ top: 11, right: 10 }}
              >
                {/* e.g. 15/300 */}
                {title.trim().length}/300
              </div>
            </div>
            <textarea
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-gray-600"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Text (optional)"
              rows={4}
            ></textarea>
            <label className="inline-flex items-center mt-3">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5"
                onClick={() => setNsfw(!nsfw)}
                checked={nsfw}
              />
              <span className="ml-2 text-gray-700">Konten dewasa? (NSFW)</span>
            </label>
            <div className="flex justify-end">
              <button
                className="px-3 py-1 blue button"
                type="submit"
                disabled={title.trim().length === 0}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      {sub && (
        <BrowserView>
          <Sidebar sub={sub} />
        </BrowserView>
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const cookie = req.headers.cookie
    if (!cookie) throw new Error('Missing auth token cookie')

    await Axios.get('/auth/me', { headers: { cookie } })

    return { props: {} }
  } catch (err) {
    res.writeHead(307, { Location: '/login' }).end()
  }
}
