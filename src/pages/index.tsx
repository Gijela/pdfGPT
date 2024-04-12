import { NextPage } from 'next'
import { MessagesProvider } from 'utils/useMessages'
import Layout from '../components/Layout'

const IndexPage: NextPage = () => {
  return (
    <MessagesProvider>
      <Layout>落地页</Layout>
    </MessagesProvider>
  )
}

export default IndexPage
