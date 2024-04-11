'use client'

import { Viewer, Worker } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import type { ToolbarSlot, TransformToolbarSlot } from '@react-pdf-viewer/toolbar'
import { toolbarPlugin } from '@react-pdf-viewer/toolbar'
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation'

const test_pdf_url =
  'https://upcdn.io/W142iXz/raw/uploads/2024/04/07/4khanYBCJj-3%20%E5%BF%AB%E9%80%9F%E4%B8%8A%E6%89%8B%EF%BC%9A%20%E5%A6%82%E4%BD%95%E7%94%A8%20Vite%20%E4%BB%8E%E9%9B%B6%E6%90%AD%E5%BB%BA%E5%89%8D%E7%AB%AF%E9%A1%B9%E7%9B%AE%EF%BC%9F.pdf'

export default function PDFView() {
  const toolbarPluginInstance = toolbarPlugin()
  const pageNavigationPluginInstance = pageNavigationPlugin()
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance

  const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
    ...slot,
    Download: () => <></>,
    SwitchTheme: () => <></>,
    Open: () => <></>
  })

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
      <div className={'w-full h-[90vh] flex-col text-white !important flex'}>
        <div
          className="align-center bg-[#eeeeee] flex p-1"
          style={{
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
          }}
        >
          <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
        </div>
        <Viewer
          fileUrl={test_pdf_url as string}
          plugins={[toolbarPluginInstance, pageNavigationPluginInstance]}
        />
      </div>
    </Worker>
  )
}
