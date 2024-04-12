/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { TwitterX } from './icons'
import { WALL_OF_LOVE } from './wallOfLove'
import Image from 'next/image'
import Link from 'next/link'
import { RoughNotation } from 'react-rough-notation'

const WallOfLove = () => {
  return (
    <section className="flex flex-col justify-center items-center pt-16 gap-12 max-w-[88%]">
      <div className="flex flex-col text-center max-w-xl gap-4">
        <h2 className="text-center text-white text-4xl lg:text-6xl">
          <RoughNotation type="highlight" show={true} color="#9333EA">
            用户评价
          </RoughNotation>
        </h2>
        <p className="text-large text-default-500 text-lg mt-4">
          只展示最受欢迎的8条评价, 如果您的评论也想被展示在此且满足条件，请与我们联系~
        </p>
      </div>
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 overflow-hidden relative transition-all">
        {WALL_OF_LOVE.map((testimonial, index) => (
          <div className="mb-4 z-0 break-inside-avoid-column" key={index}>
            <div className="border border-slate/10 rounded-lg p-4 flex flex-col items-start gap-3 h-fit">
              <div className="flex items-start justify-between w-full">
                <div className="flex items-start gap-2">
                  <Image
                    src={testimonial.user.image}
                    alt="maker"
                    height={40}
                    width={40}
                    className="w-12 h-12 rounded-full object-cover object-top"
                  />
                  <div className="flex flex-col items-start">
                    <p className="font-bold">{testimonial.user.name}</p>
                    <p className="dark:text-zinc-400">@{testimonial.user.username}</p>
                  </div>
                </div>
                <Link
                  href={`https://twitter.com/${testimonial.user.username}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  <TwitterX className="w-8 h-8" />
                </Link>
              </div>
              <p className="dark:text-zinc-200 text-[14px]">{testimonial.content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default WallOfLove
