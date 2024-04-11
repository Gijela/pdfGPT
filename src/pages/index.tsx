import MessageForm from 'components/MessageForm'
import MessagesList from 'components/MessageList'
import { NextPage } from 'next'
import { MessagesProvider } from 'utils/useMessages'
import Layout from '../components/Layout'
import PDFView from 'components/PDFView'
import { useEffect, useState } from 'react'
import Toggle from 'components/Toggle'
import Header from 'components/Header'
import UploadFile, { IPdfItem } from 'components/UploadFile'
import DocIcon from 'components/DocIcon'
import { formatDistanceToNow } from 'date-fns'

const IndexPage: NextPage = () => {
  const [pdfListLocal, setPdfListLocal] = useState<IPdfItem[]>([])
  const [chatOnlyView, setChatOnlyView] = useState<boolean>(false)
  const [curPdfUrl, setCurPdfUrl] = useState<string>('')

  useEffect(() => {
    const pdfList = localStorage.getItem('pdfList')
    if (pdfList) {
      setPdfListLocal(JSON.parse(pdfList))
    }
  }, [curPdfUrl])

  return (
    <MessagesProvider>
      <Layout>
        <Header curPdfUrl={curPdfUrl} clearCurPdfUrl={() => setCurPdfUrl('')} />
        {!curPdfUrl ? (
          <div className="mx-auto flex flex-col gap-4 container mt-10">
            <h1 className="text-4xl leading-[1.1] tracking-tighter font-medium text-center">
              与你的 PDFs 聊天
            </h1>
            {pdfListLocal.length > 0 && (
              <div className="flex flex-col gap-4 mx-10 my-5">
                <div className="flex flex-col shadow-sm border divide-y-2 sm:min-w-[650px] mx-auto">
                  {pdfListLocal.map((pdf: IPdfItem) => (
                    <div
                      key={pdf.fileUrl}
                      className="flex justify-between p-3 hover:bg-gray-100 transition sm:flex-row flex-col sm:gap-0 gap-3"
                    >
                      <button onClick={() => setCurPdfUrl(pdf.fileUrl)} className="flex gap-4">
                        <DocIcon />
                        <span>{pdf.fileName}</span>
                      </button>
                      <span>{formatDistanceToNow(pdf.createAt)} ago</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {pdfListLocal.length > 0 ? (
              <h2 className="text-3xl leading-[1.1] tracking-tighter font-medium text-center">
                或上传一个新 PDF
              </h2>
            ) : (
              <h2 className="text-3xl leading-[1.1] tracking-tighter font-medium text-center mt-5">
                没发现文件， 现在上传一个 PDF !
              </h2>
            )}
            <div className="flex justify-center">
              <UploadFile updatePdfUrl={(url: string) => setCurPdfUrl(url)} />
            </div>
          </div>
        ) : (
          <div className="h-screen flex flex-col lg:flex-row bg-gray-50">
            <Toggle chatOnlyView={chatOnlyView} setChatOnlyView={setChatOnlyView} />
            {!chatOnlyView && (
              <div className="flex-1">
                <PDFView curPdfUrl={curPdfUrl} />
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-[10px] overflow-auto">
                <MessagesList />
              </div>
              <MessageForm />
            </div>
          </div>
        )}
      </Layout>
    </MessagesProvider>
  )
}

export default IndexPage
