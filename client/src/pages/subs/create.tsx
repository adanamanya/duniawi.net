import Axios from 'axios'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { FormEvent, useState } from 'react'
import classNames from 'classnames'
import { useRouter } from 'next/router'

export default function create() {
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [nsfw, setNsfw] = useState(false)
  const [errors, setErrors] = useState<Partial<any>>({})

  const router = useRouter()
  const submitForm = async (event: FormEvent) => {
    event.preventDefault()

    try {
      const res = await Axios.post('/subs', {
        name,
        title,
        description,
        nsfw,
      })

      router.push(`/d/${res.data.name}`)
    } catch (err) {
      console.log(err)
      setErrors(err.response.data)
    }
  }

  return (
    <div className="flex bg-white">
      <Head>
        <title>Buat Komunitas</title>
      </Head>
      <div
        className="h-screen bg-center bg-cover w-36"
        style={{ backgroundImage: "url('/images/water.jfif')" }}
      ></div>
      <div className="flex flex-col justify-center p-6">
        <div className="w-98">
          <h1 className="mb-2 text-lg font-medium">Buat Komunitas Baru</h1>
          <hr />
          <form onSubmit={submitForm}>
            <div className="my-6">
              <p className="font-medium">Nama</p>
              <p className="mb-2 text-xs text-gray-500">Nama komunitas.</p>
              <input
                type="text"
                className={classNames(
                  'w-full p-3 border border-gray-200 rounded hover:border-gray-500',
                  { 'border-red-600': errors.name },
                )}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <small className="font-medium text-red-600">{errors.name}</small>
            </div>
            <div className="my-6">
              <p className="font-medium">Judul</p>
              <p className="mb-2 text-xs text-gray-500">
                Judul (akan tampil pada info).
              </p>
              <input
                type="text"
                className={classNames(
                  'w-full p-3 border border-gray-200 rounded hover:border-gray-500',
                  { 'border-red-600': errors.name },
                )}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <small className="font-medium text-red-600">{errors.title}</small>
            </div>
            <div className="my-6">
              <p className="font-medium">Deskripsi</p>
              <p className="mb-2 text-xs text-gray-500">
                Deskripsikan secara singkat untuk menjelaskan tentang komunitas
                yang akan dibuat.
              </p>
              <textarea
                className={classNames(
                  'w-full p-3 border border-gray-200 rounded hover:border-gray-500',
                  { 'border-red-600': errors.description },
                )}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={100}
              />
              <small className="font-medium text-red-600">
                {errors.description}
              </small>
            </div>
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
              <button className="px-4 py-1 text-sm font-semibold capitalize blue button">
                Gaskeunn
              </button>
            </div>
          </form>
        </div>
      </div>
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
