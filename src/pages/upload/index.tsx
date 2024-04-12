import Layout from 'components/Layout'
import UploadFile from './UploadFile'

export default function Upload() {
  return (
    <Layout>
      <div className="flex flex-col items-center">
        <h1 className="text-4xl leading-[1.1] tracking-tighter font-medium text-center my-8">
          上传PDF，开始聊天
        </h1>
        <UploadFile />
      </div>
    </Layout>
  )
}
