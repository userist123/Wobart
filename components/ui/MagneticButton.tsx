'use client'

import { type ReactNode, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react'
import { useMagneticButton } from '@/hooks/useMagneticButton'
import { cn } from '@/lib/utils'

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'accent' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

export function MagneticButton({ children, variant = 'accent', size = 'md', className, href, ...props }: MagneticButtonProps) {
  const ref = useMagneticButton(0.35) as React.RefObject<HTMLButtonElement & HTMLAnchorElement>
  const base = 'relative inline-flex items-center justify-center gap-2 font-sans font-semibold tracking-[.16em] uppercase overflow-hidden transition-[background-color,color,border-color,box-shadow] duration-150 select-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]'
  const variants = {
    accent: 'bg-[#00F0FF] text-[#050505] shadow-[0_0_24px_rgba(0,240,255,.25)] hover:bg-white hover:shadow-[0_0_32px_rgba(0,240,255,.35)]',
    ghost: 'bg-white/[.02] text-white border border-white/15 backdrop-blur-md hover:border-[#00F0FF]/60 hover:shadow-[0_0_15px_rgba(0,240,255,.2)]',
    outline: 'bg-transparent text-[#00F0FF] border border-[#00F0FF]/60 hover:bg-[#00F0FF] hover:text-[#050505]',
  }
  const sizes = { sm: 'h-10 px-5 text-[11px]', md: 'h-12 px-7 text-xs', lg: 'h-12 sm:h-14 px-8 sm:px-10 text-[13px]' }

  if (href) {
    const anchorProps = props as AnchorHTMLAttributes<HTMLAnchorElement>
    return <a ref={ref as React.RefObject<HTMLAnchorElement>} href={href} className={cn(base, variants[variant], sizes[size], className)} {...anchorProps}>{children}</a>
  }

  return <button ref={ref as React.RefObject<HTMLButtonElement>} className={cn(base, variants[variant], sizes[size], className)} {...props}>{children}</button>
}
