import CTAButton from './CTAButton'

const CTA = () => {
  return (
    <section className="flex flex-col justify-center max-w-[88%] items-center py-16 gap-12">
      <div className="flex flex-col text-center gap-4">
        <h2
          className="text-center text-4xl lg:text-6xl font-bold"
          style={{ color: 'rgb(15, 23, 42)' }}
        >
          开始使用
        </h2>
        <p className="text-large text-default-500 text-lg">立即上传文档并开始与其聊天，完全免费</p>
      </div>
      <CTAButton text={'免费开始使用'} />
    </section>
  )
}

export default CTA
