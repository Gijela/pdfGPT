import { Button } from '@apideck/components'
import { RocketIcon } from 'lucide-react'
import Link from 'next/link'

const CTAButton = ({ text }: { text: string }) => {
  return (
    <Link href="/pdfs">
      <Button
        variant="primary"
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
        aria-label="Get Boilerplate"
      >
        <RocketIcon />
        {text}
      </Button>
    </Link>
  )
}

export default CTAButton
