import Image from 'next/image'
import Link from 'next/link'
import { useModal, Button, TextInput } from '@apideck/components'
import { useEffect, useState } from 'react'

export default function Header() {
  const { addModal, removeModal } = useModal()
  const [ApiKey, setApiKey] = useState<string>('')

  const handleCloseModal = (newApiKey: string) => {
    if (newApiKey) localStorage.setItem('chat2hub_pdf_ApiKey', newApiKey)
    removeModal()
  }

  const ModalContent = () => {
    const [localApiKey, setLocalApiKey] = useState<string>(ApiKey)
    const handleChange = (e: any) => {
      const newApiKey = e.target.value
      setLocalApiKey(newApiKey)
      setApiKey(newApiKey)
    }

    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">ApiKey 填写</h3>
        <p className="my-4 text-sm text-gray-600">只有点击「确定」按钮关闭弹窗才能使 ApiKey 生效</p>
        <TextInput
          name="ApiKey input"
          value={localApiKey}
          onChange={handleChange}
          className="my-4"
          autoFocus
        />
        <Button text="确定" onClick={() => handleCloseModal(localApiKey)} />
      </div>
    )
  }

  useEffect(() => {
    const Api_Key = localStorage.getItem('chat2hub_pdf_ApiKey') || ''
    setApiKey(Api_Key)
  }, [])

  return (
    <>
      <header className="bg-white w-full border-b border-b-slate-200 shadow-sm">
        <div className="h-16 p-4">
          <nav className="flex justify-between">
            <Link href={'/'} className="flex items-center">
              <Image src="/img/favicon.ico" width={30} height={30} alt="logo"></Image>
              <span className="hidden sm:block text-2xl font-medium ml-2 hover:text-indigo-700">
                Chat2hub 的 PDF AI
              </span>
            </Link>
            <div className="flex items-center gap-5">
              <Link href={'/upload'}>
                <Button variant="danger">上传</Button>
              </Link>
              <Link href={'/pdfs'}>
                <Button variant="danger">PDFs 列表</Button>
              </Link>
              <Button variant="primary">
                <a href="https://chat2hub.com/#/subscribe" target="_blank" rel="noreferrer">
                  获取ApiKey
                </a>
              </Button>
              <Button variant="primary" onClick={() => addModal(<ModalContent />)}>
                填写Api Key
              </Button>
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}
