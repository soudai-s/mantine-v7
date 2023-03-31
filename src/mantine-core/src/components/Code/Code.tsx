import React from 'react';
import {
  Box,
  BoxProps,
  StylesApiProps,
  factory,
  ElementProps,
  useProps,
  useStyles,
  MantineColor,
  useVars,
  getThemeColor,
  useMantineTheme,
} from '../../core';
import classes from './Code.module.css';

export type CodeStylesNames = 'root';
export type CodeVariant = string;
export type CodeCssVariables = '--code-bg';

export interface CodeStylesParams {
  color: MantineColor | undefined;
  variant: CodeVariant | undefined;
}

export interface CodeProps
  extends BoxProps,
    StylesApiProps<CodeStylesNames, CodeVariant, CodeCssVariables, CodeStylesParams>,
    ElementProps<'code'> {
  /** Key of `theme.colors` or any valid CSS color, controls background color of the code, by default value is calculated based on color scheme */
  color?: MantineColor;

  /** If set code will be block instead of inline */
  block?: boolean;
}

export interface CodeFactory {
  props: CodeProps;
  ref: HTMLElement;
  stylesNames: CodeStylesNames;
  vars: CodeCssVariables;
  stylesParams: CodeStylesParams;
}

const defaultProps: Partial<CodeProps> = {};

export const Code = factory<CodeFactory>((props, ref) => {
  const { classNames, className, style, styles, unstyled, vars, color, block, variant, ...others } =
    useProps('Code', defaultProps, props);

  const getStyles = useStyles({
    name: 'Code',
    className,
    style,
    classes,
    classNames,
    styles,
    unstyled,
  });

  const _vars = useVars<CodeStylesParams>('Code', vars, { color, variant });
  const theme = useMantineTheme();

  return (
    <Box<any>
      component={block ? 'pre' : 'code'}
      ref={ref}
      {...getStyles('root')}
      data-block={block || undefined}
      vars={{
        '--code-bg': color ? getThemeColor(color, theme) : undefined,
        ..._vars,
      }}
      {...others}
      dir="ltr"
    />
  );
});

Code.displayName = '@mantine/core/Code';
