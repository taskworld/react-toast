import React, { useEffect, useRef, useState } from 'react';
import { cx, css, keyframes } from '@emotion/css';

import { CheckIcon, FlameIcon, InfoIcon, CloseIcon, AlertIcon } from './icons';
import * as colors from './colors';
import type { AppearanceTypes, Placement, ToastProps } from './types';

export const borderRadius = 4;
export const gutter = 8;
export const toastWidth = 360;
export const shrinkKeyframes = keyframes`from { height: 100%; } to { height: 0% }`;

function A11yText(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  >
) {
  return (
    <span
      {...props}
      className={cx(
        css({
          border: 0,
          clip: 'rect(1px, 1px, 1px, 1px)',
          height: 1,
          overflow: 'hidden',
          padding: 0,
          position: 'absolute',
          whiteSpace: 'nowrap',
          width: 1,
        }),
        props.className
      )}
    />
  );
}

const appearances: Record<
  AppearanceTypes,
  {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    text: string;
    fg: string;
    bg: string;
  }
> = {
  success: {
    icon: CheckIcon,
    text: colors.G500,
    fg: colors.G300,
    bg: colors.G50,
  },
  error: {
    icon: FlameIcon,
    text: colors.R500,
    fg: colors.R300,
    bg: colors.R50,
  },
  warning: {
    icon: AlertIcon,
    text: colors.Y500,
    fg: colors.Y300,
    bg: colors.Y50,
  },
  info: {
    icon: InfoIcon,
    text: colors.N400,
    fg: colors.B200,
    bg: 'white',
  },
};

function Button(props: {
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      role="button"
      className={cx(
        'react-toast-notifications__toast__dismiss-button',
        css({
          cursor: 'pointer',
          flexShrink: 0,
          opacity: 0.5,
          padding: `${gutter}px ${gutter * 1.5}px`,
          transition: 'opacity 150ms',

          ':hover': { opacity: 1 },
        })
      )}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}

function Content(props: { children: React.ReactNode }) {
  return (
    <div
      className={cx(
        'react-toast-notifications__toast__content',
        css({
          flexGrow: 1,
          fontSize: 14,
          lineHeight: 1.4,
          minHeight: 40,
          padding: `${gutter}px ${gutter * 1.5}px`,
        })
      )}
    >
      {props.children}
    </div>
  );
}

// NOTE: invoke animation when NOT `autoDismiss` with opacity of 0 to avoid a
// paint bug in FireFox.
// https://bugzilla.mozilla.org/show_bug.cgi?id=625289
function Countdown({
  autoDismissTimeout,
  opacity,
  isRunning,
}: Pick<ToastProps, 'autoDismissTimeout' | 'isRunning'> & { opacity: number }) {
  return (
    <div
      className={cx(
        'react-toast-notifications__toast__countdown',
        css({
          animation: `${shrinkKeyframes} ${autoDismissTimeout}ms linear`,
          animationPlayState: isRunning ? 'running' : 'paused',
          backgroundColor: 'rgba(0,0,0,0.1)',
          bottom: 0,
          height: 0,
          left: 0,
          opacity,
          position: 'absolute',
          width: '100%',
        })
      )}
    />
  );
}

function Icon({
  appearance,
  autoDismiss,
  autoDismissTimeout,
  isRunning,
}: Pick<
  ToastProps,
  'appearance' | 'autoDismiss' | 'autoDismissTimeout' | 'isRunning'
>) {
  const meta = appearances[appearance];
  const Glyph = meta.icon;

  return (
    <div
      className={cx(
        'react-toast-notifications__toast__icon-wrapper',
        css({
          backgroundColor: meta.fg,
          borderTopLeftRadius: borderRadius,
          borderBottomLeftRadius: borderRadius,
          color: meta.bg,
          flexShrink: 0,
          paddingBottom: gutter,
          paddingTop: gutter,
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
          width: 30,
        })
      )}
    >
      <Countdown
        autoDismissTimeout={autoDismissTimeout}
        opacity={autoDismiss ? 1 : 0}
        isRunning={isRunning}
      />
      <Glyph
        className={cx(
          'react-toast-notifications__toast__icon',
          css({ position: 'relative', zIndex: 1 })
        )}
      />
    </div>
  );
}

function getTranslate(placement: Placement) {
  const pos = placement.split('-');
  const relevantPlacement = pos[1] === 'center' ? pos[0] : pos[1];
  const translateMap: Record<string, string> = {
    right: 'translate3d(120%, 0, 0)',
    left: 'translate3d(-120%, 0, 0)',
    bottom: 'translate3d(0, 120%, 0)',
    top: 'translate3d(0, -120%, 0)',
  };

  return translateMap[relevantPlacement];
}

const toastStates = (placement: Placement) => ({
  entering: { transform: getTranslate(placement) },
  entered: { transform: 'translate3d(0,0,0)' },
  exiting: { transform: 'scale(0.66)', opacity: 0 },
  exited: { transform: 'scale(0.66)', opacity: 0 },
});

function ToastElement(
  props: Pick<
    ToastProps,
    | 'appearance'
    | 'placement'
    | 'transitionState'
    | 'transitionDuration'
    | 'onMouseEnter'
    | 'onMouseLeave'
  > & { children: React.ReactNode }
) {
  const [height, setHeight] = useState<string | number>('auto');
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.transitionState === 'entered' && elementRef.current) {
      setHeight(elementRef.current.offsetHeight + gutter);
    }

    if (props.transitionState === 'exiting') {
      setHeight(0);
    }
  }, [props.transitionState]);

  return (
    <div
      ref={elementRef}
      style={{ height }}
      className={css({
        transition: `height ${props.transitionDuration - 100}ms 100ms`,
      })}
    >
      <div
        className={cx(
          'react-toast-notifications__toast',
          `react-toast-notifications__toast--${props.appearance}`,
          css({
            backgroundColor: appearances[props.appearance].bg,
            borderRadius,
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.175)',
            color: appearances[props.appearance].text,
            display: 'flex',
            marginBottom: gutter,
            maxWidth: '100%',
            transition: `transform ${props.transitionDuration}ms cubic-bezier(0.2, 0, 0, 1), opacity ${props.transitionDuration}ms`,
            width: toastWidth,
            ...toastStates(props.placement)[props.transitionState],
          })
        )}
      >
        {props.children}
      </div>
    </div>
  );
}

export function Toast({
  appearance = 'info',
  autoDismiss,
  autoDismissTimeout,
  children,
  isRunning,
  onDismiss,
  placement,
  transitionDuration,
  transitionState,
  onMouseEnter,
  onMouseLeave,
}: ToastProps) {
  return (
    <ToastElement
      appearance={appearance}
      placement={placement}
      transitionState={transitionState}
      transitionDuration={transitionDuration}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Icon
        appearance={appearance}
        autoDismiss={autoDismiss}
        autoDismissTimeout={autoDismissTimeout}
        isRunning={isRunning}
      />
      <Content>{children}</Content>
      {onDismiss && (
        <Button onClick={onDismiss}>
          <CloseIcon className="react-toast-notifications__toast__dismiss-icon" />
          <A11yText className="react-toast-notifications__toast__dismiss-text">
            Close
          </A11yText>
        </Button>
      )}
    </ToastElement>
  );
}
