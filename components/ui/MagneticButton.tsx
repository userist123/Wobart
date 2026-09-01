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
  const base = 'relative inline-flex items-center justify-center gap-2 font-label tracking-widest uppercase overflow-hidden transition-colors duration-300 select-none rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8FF00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]'
  const variants = {
    accent: 'bg-[#E8FF00] text-[#0A0A0A] hover:bg-white',
    ghost: 'bg-transparent text-[#F0F0F0] border border-white/20 hover:border-[#E8FF00] hover:text-[#E8FF00]',
    outline: 'bg-transparent text-[#E8FF00] border border-[#E8FF00] hover:bg-[#E8FF00] hover:text-[#0A0A0A]',
  }
  const sizes = { sm: 'px-5 py-2.5 text-[11px]', md: 'px-7 py-3.5 text-xs', lg: 'px-8 sm:px-10 py-4 sm:py-5 text-sm' }

  if (href) {
    const anchorProps = props as AnchorHTMLAttributes<HTMLAnchorElement>
    return <a ref={ref as React.RefObject<HTMLAnchorElement>} href={href} className={cn(base, variants[variant], sizes[size], className)} {...anchorProps}>{children}</a>
  }

  return <button ref={ref as React.RefObject<HTMLButtonElement>} className={cn(base, variants[variant], sizes[size], className)} {...props}>{children}</button>
}
