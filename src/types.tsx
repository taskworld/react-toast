import type React from 'react';

export type AppearanceTypes = 'error' | 'info' | 'success' | 'warning';
export type Id = Symbol;
export type Callback = (id: Id) => void;
export type Options = {
  appearance: AppearanceTypes;
  autoDismiss?: boolean;
  onDismiss?: Callback;
};

export type AddFn = (content: React.ReactNode, options?: Options) => Id;
export type UpdateFn = (id: Id, options: Options) => void;
export type RemoveFn = (id: Id) => void;

export type HoverFn = () => void;

export type Placement =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'top-right';

export type ToastType = Options & {
  appearance: AppearanceTypes;
  content: React.ReactNode;
  id: Id;
};
export type ToastsType = ReadonlyArray<ToastType>;

export type TransitionState = 'entering' | 'entered' | 'exiting' | 'exited';

export type ToastProps = {
  appearance: AppearanceTypes;
  autoDismiss: boolean; // may be inherited from ToastProvider
  autoDismissTimeout: number; // inherited from ToastProvider
  children: React.ReactNode;
  isRunning: boolean;
  onDismiss: () => void;
  onMouseEnter?: HoverFn;
  onMouseLeave?: HoverFn;
  placement: Placement;
  transitionDuration: number; // inherited from ToastProvider
  transitionState: TransitionState; // inherited from ToastProvider
};

export type ToastContainerProps = {
  children?: React.ReactNode;
  hasToasts: boolean;
  placement: Placement;
};
