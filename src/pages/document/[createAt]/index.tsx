import { useEffect, useState } from 'react'
import { IPdfItem } from 'pages/upload/UploadFile'
import Layout from 'components/Layout'

import MessageForm from './MessageForm'
import MessagesList from './MessageList'
import PDFView from './PDFView'
import Toggle from './Toggle'

export default function Document() {
  const [chatOnlyView, setChatOnlyView] = useState<boolean>(false)
  const [nowPdfUrl, setNowPdfUrl] = useState<string>('')

  useEffect(() => {
    const createAtTime = window.location.href.split('document/')[1]
    const localPdfListStr = localStorage.getItem('pdfList')
    const pdfList: IPdfItem[] = localPdfListStr ? JSON.parse(localPdfListStr) : []
    pdfList.forEach((item) => {
      if (item.createAt === Number(createAtTime)) setNowPdfUrl(item.fileUrl)
    })
  }, [])

  return (
    <Layout>
      <div className="h-screen flex flex-col lg:flex-row bg-gray-50">
        <Toggle chatOnlyView={chatOnlyView} setChatOnlyView={setChatOnlyView} />
        {!chatOnlyView && (
          <div className="flex-1">
            <PDFView curPdfUrl={nowPdfUrl} />
          </div>
        )}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-[10px] overflow-auto">
            <MessagesList />
          </div>
          <MessageForm />
        </div>
      </div>
    </Layout>
  )
}
