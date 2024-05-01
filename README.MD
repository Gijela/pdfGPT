# ChatGPT流式数据渲染：一份面向初学者的最佳实践演示
## 解决问题
通读这篇 README，你可以解决以下问题：
1. 怎么发起SSE流式请求？
2. 怎么获取到返回的流式数据？怎么监听流式请求结束？
3. 拿到流式数据怎么渲染？
4. 对于代理的openAi api, 怎么将自己的`BASE_URL`隐藏起来？
5. chatgpt 聊天窗口如何组件化，如何提高其复用性？
6. 如何封装一个PDF展示组件，通过传入PDF链接就可以正常渲染PDF，并且集成PDF的操作工具如翻页、放大等？
7. 如何封装高度可复用上传组件，文件上传后返回文件的url？

## 1. 怎么发起SSE流式请求？

### （1）new EventSource
> SSE 流式数据请求不清楚概念的可以点击[这里](https://developer.mozilla.org/zh-CN/docs/Web/API/EventSource)  

一句话概括SSE请求的现象：客户端发起SSE请求后，服务端不断地返回(流式返回)生成的最新结果，当服务端数据生成完毕，则返回最后一条流信息`[DONE]`。

依据[MDN文档](https://developer.mozilla.org/zh-CN/docs/Web/API/EventSource)，使用`new EventSource`发起流式请求的简单例子如下：
```js
const mockUrl = 'https://chat2hub.com'
const evtSource = new EventSource(mockUrl);

// 接收流消息
evtSource.onmessage = (event) => {
  console.log('流消息内容：', event.data)
};
// onopen、onerror事件参考文档
```
`new EventSource`发起请求有个缺点，就是携带数据不方便，携带参数只能通过在链接处拼参数的方式去实现。

比如我在请求`https://chat2hub.com`时，需要携带messages、ApiKey参数，就只能通过**https://chat2hub.com?messages=测试文本&ApiKey=sk-dadasd** 这种形式去带参。

因为chatgpt聊天是有上下文，且url携带参数是有字符限制的，所以这种方式**不合适**。

### （2）@fortaine/fetch-event-source
>依赖库的介绍、安装等请点击[这里](https://www.npmjs.com/package/@fortaine/fetch-event-source)  

优势：
1. 更易携带参数。
2. 更易获取流式连接状态。`业务处理中通常会用到此状态`

下面是个使用依赖库发起流式请求的简单例子：

```js
// 一些必要的参数
enum SSE_Status_Map {
  DEFAULT_STATUS = -1, // 默认值
  CONNECTING = 0,  // 连接中，但未连接上
  OPEN = 1, // 已连接上
  CLOSED = 2 // 断开
}

import { fetchEventSource } from '@fortaine/fetch-event-source'
const [connectStatus, setConnectStatus] = useState<number>(SSE_Status_Map.DEFAULT_STATUS) 
```

```js
// 请求流式数据 & 处理数据
const newControllerSSE = new AbortController()
setConnectStatus(SSE_Status_Map.CONNECTING) // 开启尝试去连接，此时未连接上

fetchEventSource('https://chat2hub.com', {
  method: 'POST',
  body: JSON.stringify({ message: "测试文本", ApiKey: 'sk-cnhs' }),
  signal: newControllerSSE.signal,
  openWhenHidden: true,
  onopen: async function (res) {
    setConnectStatus(SSE_Status_Map.OPEN) // 已连接上
    // 错误处理。401 500 等状态码
  },
  onmessage: function (event) {
    // 流信息结束标志
    if (event.data === '[DONE]') return

    // 业务处理。流信息为 event.data 
  },
  onclose() {
    setConnectStatus(SSE_Status_Map.CLOSED) // 断开连接
  },
  onerror(e) {
    setConnectStatus(SSE_Status_Map.CLOSED) // 断开连接
    throw e
  }
})
```

## 2. 怎么获取到返回的流式数据？怎么监听流式数据返回结束？
如上依赖库发起请求例子代码，在`onmessage`中可以获取到流式数据，也可以监听到流式数据结束返回。
```js
onmessage: function (event) {
  // 流式数据返回结束标志[DONE]
  if (event.data === '[DONE]') return

  // 流式数据正常返回中，在这里做业务处理。流信息为 event.data
},
```

## 3. 拿到流式数据怎么渲染？

思路：转换位markdown格式渲染。  

牵扯文件过多，请查看`pages/document/[createAt]/markdownRender/markdown.tsx`处代码。

## 4. 对于代理的openAi api, 怎么将自己的BASE_URL隐藏起来
答案：**通过nextjs的api路由**。

我们将请求mockUrl`https://chat2hub.com`的任务放到api路由中，如新建`pages/api/createMessage.ts`，在其中写具体的SSE请求，然后我们通过 `fetchEventSource('/api/createMessage', {...})` 就可以去完成流式请求了，其中...省略的内容与发起请求部分相同。`createMessage.ts`简单例子如下：

```ts
import { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { messages, ApiKey } = JSON.parse(req.body)
  const url = `${process.env.BASE_URL}/v1/chat/completions`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${ApiKey as string}`
      },
      body: JSON.stringify({
        messages: messages,
        model: 'gpt-3.5-turbo',
        stream: true
      })
    })

    // get stream reader
    if (!response.body) throw new Error('No response body')
    const reader = response.body?.getReader()

    // read stream & return stream data
    // required headers: { 'Content-Type': 'text/event-stream', 'Content-Encoding': 'none' }
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Content-Encoding': 'none' })
    reader.read().then(function processStream({ done, value }): Promise<void> | undefined {
      if (done) {
        res.end()
        return
      }

      res.write(new TextDecoder().decode(value))

      return reader.read().then(processStream)
    })
  } catch (error) {
    res.status(500).json({ error: error })
  }
}
```

## 5. chatgpt 聊天组件
思路：新建一个hook去发起流式请求，保存数据在hook中，其他组件通过调用该hook来获取数据。

hook的路径为`hooks/useMessages.tsx`  
chatgpt组件入口为`pages/document/[createAt]/index.tsx`  

牵扯文件过多，不变展示，请自行查看代码。

## 6. PDFView 组件

1. 安装依赖
```bash
pnpm i @react-pdf-viewer/core@3.12.0 @react-pdf-viewer/default-layout@3.12.0 @react-pdf-viewer/page-navigation@3.12.0 @react-pdf-viewer/toolbar@3.12.0 pdfjs-dist@3.4.120
```

2. 组件代码：
```tsx
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
      <div className={'w-full h-[95vh] flex-col text-white !important flex'}>
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

```


## 7. 上传组件
1. 安装依赖
```bash 
pnpm i react-uploader@3.43.0 uploader@3.48.3
```

2. 组件代码
```tsx
import { useRouter } from 'next/navigation'
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
      primary: '#9333EA', // Primary buttons & links
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

export default function UploadFile() {
  const router = useRouter()

  return (
    <UploadDropzone
      uploader={uploader}
      options={options}
      onUpdate={(file) => {
        if (file.length !== 0) {
          const { fileUrl, file: originalFileObj, lastModified: createAt } = file[0].originalFile

          // 保存到浏览器本地
          const localPdfList = localStorage.getItem('pdfList')
          const pdfList: IPdfItem[] = localPdfList ? JSON.parse(localPdfList) : []
          pdfList.unshift({ fileUrl, fileName: originalFileObj.name, createAt })
          localStorage.setItem('pdfList', JSON.stringify(pdfList))

          // 页面跳转
          router.push(`/document/${createAt}`)
        }
      }}
      width="470px"
      height="250px"
    />
  )
}
```

3. 在[byteScale](https://www.bytescale.com/)中获取ApiKey，在项目的`.env`中配置`NEXT_PUBLIC_BYTESCALE_API_KEY=ApiKey`

## 参考

[1. nextJS 实现 SSE](https://zhuanlan.zhihu.com/p/617792931)  
[2. nextJS api路由中res.write()没有逐个将SSE流数据发送到客户端，而是等待res.end()一次性发送的原因(nextJs server compress everything by default)](https://stackoverflow.com/questions/74408942/how-to-forward-server-sent-events-in-nextjs-api)  