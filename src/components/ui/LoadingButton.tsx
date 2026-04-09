import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type LoadingButtonProps = {
  onPress: () => Promise<void>
  label: string
  loadingLabel?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link'
  className?: string
}

export default function LoadingButton({
  onPress,
  label,
  loadingLabel,
  disabled = false,
  type = 'button',
  variant = 'default',
  className,
}: LoadingButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (disabled || isLoading) return
    setIsLoading(true)
    try {
      await onPress()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type={type}
      variant={variant}
      onClick={() => void handleClick()}
      disabled={disabled || isLoading}
      className={className}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {isLoading ? loadingLabel || label : label}
    </Button>
  )
}
