import { NextPage } from 'next'
import Layout from '../components/Layout'
import Hero from 'components/home/Hero'
import SocialProof from 'components/home/SocialProof'
import ScrollingLogos from 'components/home/ScrollingLogos'
import WallOfLove from 'components/home/walloflove'
import CTA from 'components/home/CTA'
import Feature from 'components/home/feature'

const IndexPage: NextPage = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center">
        <Hero />
        <SocialProof />
        <ScrollingLogos />
        <Feature />
        <WallOfLove />
        <CTA />
      </div>
    </Layout>
  )
}

export default IndexPage
