import Head from 'next/head'
import React, { ReactNode } from 'react'

type Props = {
  children: ReactNode
  title?: string
  description?: string
  favicon?: string
}

const Layout = ({
  children,
  title = 'PDF - Chat2hub.com',
  description = 'A Next.js starter kit with TypeScript, Tailwind, Jest, Prettier, and Eslint',
  favicon = '/img/favicon.ico'
}: Props) => (
  <div className="font-basier-circle">
    <Head>
      <title>{title}</title>
      <meta name="description" content={description}></meta>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link rel="icon" href={favicon} />
    </Head>
    <div className="bg-gray-50">{children}</div>
  </div>
)

export default Layout
