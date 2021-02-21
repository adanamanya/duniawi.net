import React, { useEffect } from 'react'
import MiniValine from 'minivaline'

const ValineComment = ({ id }) => {
  useEffect(() => {
    if (!window) {
      return
    }
    new MiniValine({
      el: '#vcomments',
      mode:'DesertsP',
      placeholder: 'Tulis Komentar',
      lang: 'en',
      visitor: true,
      barrager: 0,
      backend: 'waline',
      path: id,
      serverURL: 'https://duniawi-waline.vercel.app',
      region: true,
      enableUA: false,
      md: true,
      requiredFields: []
    })
  }, [id])

  return <div id="vcomments" className="mx-auto" />
}

export default ValineComment
