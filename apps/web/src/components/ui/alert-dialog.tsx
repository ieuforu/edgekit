import * as React from 'react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'

import { cn } from '#lib/utils'

function AlertDialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

function AlertDialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-200 ease-out data-open:opacity-100 data-closed:opacity-0',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogContent({ className, children, ...props }: DialogPrimitive.Popup.Props) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <DialogPrimitive.Popup
        data-slot="alert-dialog-content"
        className={cn(
          'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-gray-200 bg-white p-6 opacity-0 scale-95 transition-all duration-200 ease-out data-open:opacity-100 data-open:scale-100 data-closed:opacity-0 data-closed:scale-95 sm:max-w-lg',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      data-slot="alert-dialog-title"
      className={cn('text-lg font-semibold text-foreground', className)}
      {...props}
    />
  )
}

function AlertDialogDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="alert-dialog-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function AlertDialogAction({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="alert-dialog-action" {...props} />
}

function AlertDialogCancel({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="alert-dialog-cancel" {...props} />
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
