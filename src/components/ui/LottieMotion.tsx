'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

type LottieMotionProps = {
  src: string;
  className?: string;
};

export function LottieMotion({ src, className }: LottieMotionProps) {
  return (
    <DotLottieReact
      autoplay
      loop
      src={src}
      className={className}
    />
  );
}
