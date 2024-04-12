'use client'
import { LineText } from './LineText'
import CTAButton from './CTAButton'
import { motion } from 'framer-motion'

const Hero = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
          ease: [0, 0.71, 0.2, 1],
          scale: {
            type: 'tween' // tween spring
            // damping: 10, // if spring
            // stiffness: 50, // if spring
            // restDelta: 0.001, // if spring
          }
        }}
      >
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 pt-16 md:pt-24 text-center">
          <h1 className="text-5xl lg:text-7xl font-bold">
            与您的 PDF 文档 <LineText>聊天</LineText>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-2xl tracking-tight text-slate-700 dark:text-slate-400">
            从法律协议到财务报告，PDF AI
            让您的文档栩栩如生。您可以提出问题、获取摘要、查找信息等等。
          </p>
        </section>
      </motion.div>
      <div className="flex justify-center">
        <CTAButton text={'免费开始使用'}></CTAButton>
      </div>
    </>
  )
}

export default Hero
