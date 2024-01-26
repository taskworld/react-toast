import React from 'react';

import type { ToastProps } from './types';

class Timer {
  private timerId: number | undefined;
  private start: number;
  private remaining: number;

  constructor(
    private callback: () => void,
    delay: number
  ) {
    this.start = delay;
    this.remaining = delay;

    this.resume();
  }

  clear() {
    clearTimeout(this.timerId);
  }

  pause() {
    clearTimeout(this.timerId);
    this.remaining -= Date.now() - this.start;
  }

  resume() {
    this.start = Date.now();
    clearTimeout(this.timerId);
    this.timerId = window.setTimeout(this.callback, this.remaining);
  }
}

type Props = Omit<ToastProps, 'isRunning'> & {
  component: React.ComponentType<ToastProps>;
};

export class ToastController extends React.Component<
  Props,
  { isRunning: boolean }
> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isRunning: Boolean(this.props.autoDismiss),
    };
  }

  private timeout: Timer | null = null;

  componentDidMount() {
    this.startTimer();
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.autoDismiss !== this.props.autoDismiss) {
      const startOrClear = this.props.autoDismiss
        ? this.startTimer
        : this.clearTimer;

      startOrClear();
    }
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  startTimer = () => {
    const { autoDismiss, autoDismissTimeout, onDismiss } = this.props;

    if (!autoDismiss) return;

    this.setState({ isRunning: true });
    this.timeout = new Timer(onDismiss, autoDismissTimeout);
  };

  clearTimer = () => {
    if (this.timeout) this.timeout.clear();
  };

  onMouseEnter = () => {
    this.setState({ isRunning: false }, () => {
      if (this.timeout) this.timeout.pause();
    });
  };

  onMouseLeave = () => {
    this.setState({ isRunning: true }, () => {
      if (this.timeout) this.timeout.resume();
    });
  };

  render() {
    const {
      autoDismiss,
      autoDismissTimeout,
      component: Toast,
      ...passThroughProps
    } = this.props;

    return (
      <Toast
        autoDismiss={autoDismiss}
        autoDismissTimeout={autoDismissTimeout}
        isRunning={this.state.isRunning}
        {...passThroughProps}
        onMouseEnter={autoDismiss ? this.onMouseEnter : undefined}
        onMouseLeave={autoDismiss ? this.onMouseLeave : undefined}
      />
    );
  }
}
