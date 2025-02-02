import React, { forwardRef } from 'react';
import { ElementProps } from '../../core';
import { Overlay, OverlayProps } from '../Overlay';
import { Transition, TransitionOverride } from '../Transition';
import { useModalTransition } from './use-modal-transition';
import { useModalBaseContext } from './ModalBase.context';

export interface ModalBaseOverlayProps
  extends Omit<OverlayProps, 'styles' | 'classNames' | 'variant' | 'vars'>,
    ElementProps<'div', 'color'> {
  /** Props passed down to the `Transition` component */
  transitionProps?: TransitionOverride;
}

export const ModalBaseOverlay = forwardRef<HTMLDivElement, ModalBaseOverlayProps>(
  ({ onClick, transitionProps, style, ...others }, ref) => {
    const ctx = useModalBaseContext();
    const transition = useModalTransition(transitionProps);

    return (
      <Transition mounted={ctx.opened} {...transition} transition="fade">
        {(transitionStyles) => (
          <Overlay
            ref={ref}
            fixed
            style={[style, transitionStyles]}
            zIndex={ctx.zIndex}
            radius={0}
            unstyled={ctx.unstyled}
            onClick={(event) => {
              onClick?.(event);
              ctx.closeOnClickOutside && ctx.onClose();
            }}
            {...others}
          />
        )}
      </Transition>
    );
  }
);

ModalBaseOverlay.displayName = '@mantine/core/ModalBaseOverlay';
