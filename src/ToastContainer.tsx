import React from 'react';
import { cx, css } from '@emotion/css';

import { ToastContainerProps, Placement } from './types';

const placements: Record<Placement, React.CSSProperties> = {
  'top-left': { top: 0, left: 0 },
  'top-center': { top: 0, left: '50%', transform: 'translateX(-50%)' },
  'top-right': { top: 0, right: 0 },
  'bottom-left': { bottom: 0, left: 0 },
  'bottom-center': { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
  'bottom-right': { bottom: 0, right: 0 },
};

export function ToastContainer(props: ToastContainerProps) {
  return (
    <div
      className={cx(
        'react-toast-notifications__container',
        css({
          boxSizing: 'border-box',
          maxHeight: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          padding: 8,
          pointerEvents: props.hasToasts ? undefined : 'none',
          position: 'fixed',
          zIndex: 1000,
          ...placements[props.placement],
        })
      )}
    >
      {props.children}
    </div>
  );
}
