import { UploadDropzone } from 'react-uploader'
import { Uploader } from 'uploader'

const uploader = Uploader({
  apiKey: process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
    ? process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
    : 'no api key found'
})

const options = {
  maxFileCount: 1,
  mimeTypes: ['application/pdf'],
  editor: { images: { crop: false } },
  styles: {
    colors: {
      primary: '#000', // Primary buttons & links
      error: '#d23f4d' // Error messages
    }
  }
  // onValidate: async (file: File): Promise<undefined | string> => {
  //   return docsList.length > 3
  //     ? `You've reached your limit for PDFs.`
  //     : undefined;
  // },
}

export interface IPdfItem {
  fileUrl: string
  fileName: string
  createAt: number
}

export default function UploadFile({ updatePdfUrl }: { updatePdfUrl: (url: string) => void }) {
  return (
    <UploadDropzone
      uploader={uploader}
      options={options}
      onUpdate={(file) => {
        if (file.length !== 0) {
          const { fileUrl, file: originalFileObj, lastModified: createAt } = file[0].originalFile
          updatePdfUrl(fileUrl)

          // 保存到浏览器本地
          const localPdfList = localStorage.getItem('pdfList')
          const pdfList: IPdfItem[] = localPdfList ? JSON.parse(localPdfList) : []
          pdfList.unshift({ fileUrl, fileName: originalFileObj.name, createAt })
          localStorage.setItem('pdfList', JSON.stringify(pdfList))
        }
      }}
      width="470px"
      height="250px"
    />
  )
}
