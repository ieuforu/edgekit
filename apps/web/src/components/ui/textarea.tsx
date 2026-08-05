import * as React from 'react'

import { cn } from '#lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-16 w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-gray-300 focus:border-gray-300 focus:ring-1 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
