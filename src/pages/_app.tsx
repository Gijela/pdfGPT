import 'styles/globals.css'
import 'styles/tailwind.css'

import { ModalProvider, ToastProvider } from '@apideck/components'

import { AppProps } from 'next/app'
import Header from 'components/Header'

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <ToastProvider>
      <ModalProvider>
        <Header />
        <Component {...pageProps} />
      </ModalProvider>
    </ToastProvider>
  )
}
