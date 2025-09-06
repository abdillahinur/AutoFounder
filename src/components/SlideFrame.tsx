import React from 'react';
import { getFormat, SlideFormat } from '../constants/slide';
import clsx from 'clsx';

type Mode = 'fit' | 'actual'; // fit = responsive; actual = 96 px/in

export function SlideFrame({
  children,
  format = 'w16x9',
  mode = 'fit',
  className,
  maxWidth = 1280,   // cap in "fit" mode
}: {
  children: React.ReactNode;
  format?: SlideFormat;
  mode?: Mode;
  className?: string;
  maxWidth?: number;
}) {
  const f = getFormat(format);
  const style: React.CSSProperties = {
    aspectRatio: f.ratio,               // keeps the exact 16:9 or 4:3 ratio
    width: mode === 'actual' ? f.actualPx.w : '100%',
    maxWidth: mode === 'fit' ? maxWidth : undefined,
    height: mode === 'actual' ? f.actualPx.h : undefined,
  };
  return (
    <div className={clsx('relative rounded-2xl overflow-hidden bg-transparent', className)} style={style}>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
