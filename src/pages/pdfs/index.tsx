import UploadFile, { IPdfItem } from 'pages/upload/UploadFile'
import DocIcon from './DocIcon'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from 'components/Layout'

export default function PDFs() {
  const [pdfListLocal, setPdfListLocal] = useState<IPdfItem[]>([])
  const router = useRouter()

  useEffect(() => {
    const pdfList = localStorage.getItem('pdfList')
    if (pdfList) {
      setPdfListLocal(JSON.parse(pdfList))
    }
  }, [])

  return (
    <Layout>
      <div className="mx-auto flex flex-col gap-4 container mt-10">
        <h1 className="text-4xl leading-[1.1] tracking-tighter font-medium text-center">
          与你的 PDFs 聊天
        </h1>
        {pdfListLocal.length > 0 && (
          <div className="flex flex-col gap-4 mx-10 my-5">
            <div className="flex flex-col shadow-sm border divide-y-2 sm:min-w-[650px] mx-auto">
              {pdfListLocal.map((pdf: IPdfItem) => (
                <div
                  key={pdf.createAt}
                  className="flex justify-between p-3 hover:bg-gray-100 transition sm:flex-row flex-col sm:gap-0 gap-3"
                >
                  <button
                    onClick={() => router.push(`/document/${pdf.createAt}`)}
                    className="flex gap-4"
                  >
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
          <UploadFile />
        </div>
      </div>
    </Layout>
  )
}
