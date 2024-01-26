import React, { useContext } from 'react';
import { createPortal } from 'react-dom';
import { Transition, TransitionGroup } from 'react-transition-group';

import { ToastController } from './ToastController';
import {
  AddFn,
  UpdateFn,
  RemoveFn,
  ToastsType,
  Options,
  Placement,
  Id,
  ToastProps,
  ToastContainerProps,
} from './types';

type Context = {
  add: AddFn;
  remove: RemoveFn;
  removeAll: () => void;
  update: UpdateFn;
  toasts: ToastsType;
};

const ToastContext = React.createContext<Context | null>(null);

const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

type Props = {
  // A convenience prop; the time until a toast will be dismissed automatically, in milliseconds.
  // Note that specifying this will override any defaults set on individual children Toasts.
  autoDismissTimeout: number;
  // Whether or not to dismiss the toast automatically after `autoDismissTimeout`.
  autoDismiss: boolean;
  // Unrelated app content
  children: React.ReactNode;
  // Component replacement object
  components: {
    Toast: React.ComponentType<ToastProps>;
    ToastContainer: React.ComponentType<ToastContainerProps>;
  };
  // When true, insert new toasts at the top of the stack
  newestOnTop: boolean;
  // Where, in relation to the viewport, to place the toasts
  placement: Placement;
  // Which element to attach the container's portal to, defaults to the `body`.
  portalTargetSelector?: string;
  // A convenience prop; the duration of the toast transition, in milliseconds.
  // Note that specifying this will override any defaults set on individual children Toasts.
  transitionDuration: number;
};

export class ToastProvider extends React.Component<
  Props,
  { toasts: ToastsType }
> {
  static defaultProps = {
    autoDismiss: false,
    autoDismissTimeout: 5000,
    newestOnTop: false,
    placement: 'top-right',
    transitionDuration: 220,
  };

  private idCounter = 0;

  constructor(props: Props) {
    super(props);

    this.state = { toasts: [] };
  }

  // Internal Helpers
  // ------------------------------

  has = (id: Symbol) => {
    if (!this.state.toasts.length) {
      return false;
    }

    return Boolean(this.state.toasts.filter((t) => t.id === id).length);
  };
  onDismiss = (id: Id, callback?: (id: Id) => void) => () => {
    callback?.(id);
    this.remove(id);
  };

  // Public API
  // ------------------------------

  add = (
    content: React.ReactNode,
    options?: Options,
    callback?: (id: Id) => void
  ): Id => {
    const id = Symbol(++this.idCounter);

    // bail if a toast exists with this ID
    if (this.has(id)) {
      return id;
    }

    // update the toast stack
    this.setState(
      (state) => {
        const newToast = {
          appearance: 'info' as const,
          content,
          id,
          ...options,
        };
        const toasts = this.props.newestOnTop
          ? [newToast, ...state.toasts]
          : [...state.toasts, newToast];

        return { toasts };
      },
      () => {
        callback?.(id);
      }
    );

    // consumer may want to do something with the generated ID (and not use the callback)
    return id;
  };
  remove = (id: Id, callback?: (id: Id) => void) => {
    // bail if NO toasts exists with this ID
    if (!this.has(id)) {
      return;
    }

    this.setState(
      (state) => {
        const toasts = state.toasts.filter((t) => t.id !== id);
        return { toasts };
      },
      () => {
        callback?.(id);
      }
    );
  };
  removeAll = () => {
    if (!this.state.toasts.length) {
      return;
    }

    this.state.toasts.forEach((t) => this.remove(t.id));
  };
  update = (id: Id, options?: Options, callback?: (id: Id) => void) => {
    // bail if NO toasts exists with this ID
    if (!this.has(id)) {
      return;
    }

    // update the toast stack
    this.setState(
      (state) => {
        const old = state.toasts;
        const i = old.findIndex((t) => t.id === id);
        const updatedToast = { ...old[i], ...options };
        const toasts = [...old.slice(0, i), updatedToast, ...old.slice(i + 1)];

        return { toasts };
      },
      () => {
        callback?.(id);
      }
    );
  };

  render() {
    const {
      autoDismiss: inheritedAutoDismiss,
      autoDismissTimeout,
      components,
      placement,
      portalTargetSelector,
      transitionDuration,
    } = this.props;
    const { Toast, ToastContainer } = components;
    const { add, remove, removeAll, update } = this;
    const toasts = Object.freeze(this.state.toasts);

    const hasToasts = toasts.length > 0;
    const portalTarget = canUseDOM
      ? portalTargetSelector
        ? document.querySelector(portalTargetSelector)
        : document.body
      : null;

    return (
      <ToastContext.Provider value={{ add, remove, removeAll, update, toasts }}>
        {this.props.children}

        {portalTarget ? (
          createPortal(
            <ToastContainer placement={placement} hasToasts={hasToasts}>
              <TransitionGroup component={null}>
                {toasts.map(
                  ({
                    appearance,
                    autoDismiss,
                    content,
                    id,
                    onDismiss,
                    ...unknownConsumerProps
                  }) => (
                    <Transition
                      appear
                      key={id.toString()}
                      mountOnEnter
                      timeout={transitionDuration}
                      unmountOnExit
                    >
                      {(transitionState) =>
                        transitionState !== 'unmounted' && (
                          <ToastController
                            key={id.toString()}
                            appearance={appearance}
                            autoDismiss={
                              autoDismiss !== undefined
                                ? autoDismiss
                                : inheritedAutoDismiss
                            }
                            autoDismissTimeout={autoDismissTimeout}
                            component={Toast}
                            onDismiss={this.onDismiss(id, onDismiss)}
                            placement={placement}
                            transitionDuration={transitionDuration}
                            transitionState={transitionState}
                            {...unknownConsumerProps}
                          >
                            {content}
                          </ToastController>
                        )
                      }
                    </Transition>
                  )
                )}
              </TransitionGroup>
            </ToastContainer>,
            portalTarget
          )
        ) : (
          <ToastContainer placement={placement} hasToasts={hasToasts} /> // keep ReactDOM.hydrate happy
        )}
      </ToastContext.Provider>
    );
  }
}

export const ToastConsumer = (props: {
  children: (context: Context) => React.ReactNode;
}) => (
  <ToastContext.Consumer>
    {(context) => props.children(context!)}
  </ToastContext.Consumer>
);

export const withToastManager = (Comp: React.ComponentType<any>) =>
  React.forwardRef((props: any, ref: React.Ref<any>) => (
    <ToastConsumer>
      {(context) => <Comp toastManager={context} {...props} ref={ref} />}
    </ToastConsumer>
  ));

export const useToasts = () => {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw Error(
      'The `useToasts` hook must be called from a descendent of the `ToastProvider`.'
    );
  }

  return {
    addToast: ctx.add,
    removeToast: ctx.remove,
    removeAllToasts: ctx.removeAll,
    updateToast: ctx.update,
    toastStack: ctx.toasts,
  };
};
