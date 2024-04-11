import MessageForm from 'components/MessageForm'
import MessagesList from 'components/MessageList'
import { NextPage } from 'next'
import { MessagesProvider } from 'utils/useMessages'
import Layout from '../components/Layout'
import PDFView from 'components/PDFView'
import { useState } from 'react'
import Toggle from 'components/Toggle'
import Header from 'components/Header'

const IndexPage: NextPage = () => {
  const [chatOnlyView, setChatOnlyView] = useState(false)

  return (
    <MessagesProvider>
      <Layout>
        <Header />
        <div className="h-screen flex flex-col lg:flex-row">
          <Toggle chatOnlyView={chatOnlyView} setChatOnlyView={setChatOnlyView} />
          {!chatOnlyView && (
            <div className="flex-1">
              <PDFView />
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
    </MessagesProvider>
  )
}

export default IndexPage
