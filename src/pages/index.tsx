import MessageForm from 'components/MessageForm'
import MessagesList from 'components/MessageList'
import { NextPage } from 'next'
import { MessagesProvider } from 'utils/useMessages'
import Layout from '../components/Layout'
import PDFView from 'components/PDFView'

const IndexPage: NextPage = () => {
  return (
    <MessagesProvider>
      <Layout>
        <div className="min-h-screen flex flex-col lg:flex-row">
          <div className="flex-1">
            <PDFView />
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-[10px]">
              <MessagesList />
            </div>
            <MessageForm />
          </div>
        </div>
      </Layout>
    </MessagesProvider>
  )
}

export default IndexPage
