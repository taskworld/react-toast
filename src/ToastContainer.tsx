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
        css`
          box-sizing: border-box;
          max-height: 100%;
          max-width: 100%;
          overflow: hidden;
          padding: 8px;
          position: fixed;
          z-index: 1000;
        `
      )}
      style={{
        pointerEvents: props.hasToasts ? undefined : 'none',
        ...placements[props.placement],
      }}
    >
      {props.children}
    </div>
  );
}
