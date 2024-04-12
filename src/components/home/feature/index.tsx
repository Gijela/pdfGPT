import { FEATURES_ZH } from './feature'
import React from 'react'
import { RoughNotation } from 'react-rough-notation'

const Feature = () => {
  return (
    <section className="flex flex-col justify-center lg:max-w-7xl md:max-w-5xl w-[95%] mx-auto md:gap-14 py-6">
      <h2 className="text-center text-white text-4xl lg:text-6xl">
        <RoughNotation type="highlight" show={true} color="#9333EA">
          使用方法
        </RoughNotation>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES_ZH?.map((feature, index) => (
          <div
            key={feature.title}
            className={`
              flex flex-col items-center text-center px-8 py-6 border-b
              ${index === 0 ? 'md:border-r' : ''}
              ${index === 1 ? 'lg:border-r' : ''}
              ${index === 2 ? 'md:border-r lg:border-r-0' : ''}
              ${index === 3 ? 'lg:border-b-0 lg:border-r' : ''}
              ${index === 4 ? 'md:border-b-0 md:border-r' : ''}
              ${index === 5 ? 'border-b-0 border-r-0' : ''}
            `}
          >
            <div className="p-4 w-16 h-16 dark:text-white rounded-full flex items-center justify-center">
              {feature.icon && React.createElement(feature.icon, { className: 'text-2xl' })}
            </div>
            <h2 className={'text-xl font-semibold mb-2'}>{feature.title}</h2>
            <p className="text-slate-700 dark:text-slate-400">{feature.content}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Feature
