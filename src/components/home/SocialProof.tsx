import Image from 'next/image'

const Makers = [
  {
    image: '/users/1.png'
  },
  {
    image: '/users/2.png'
  },
  {
    image: '/users/3.png'
  },
  {
    image: '/users/4.png'
  },
  {
    image: '/users/5.png'
  }
]

const SocialProof = () => {
  return (
    <section className="flex flex-col items-center justify-center gap-20 mt-14">
      <div className="flex flex-col items-center gap-5">
        <div className="flex items-center justify-center">
          {Makers.map((user, index) => {
            return (
              <Image
                key={index}
                src={user.image}
                alt="User"
                height={40}
                width={40}
                className="rounded-full -m-[5px] border border-white"
              />
            )
          })}
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-400">
          受到 <span className="text-primary font-semibold text-base">10000+</span>{' '}
          名用户的喜爱，并且还在不断增加！
        </p>
      </div>
    </section>
  )
}

export default SocialProof
