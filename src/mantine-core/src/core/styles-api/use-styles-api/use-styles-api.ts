import { CSSProperties } from 'react';
import cx from 'clsx';
import { MantineTheme, useMantineTheme, useMantineClassNamesPrefix } from '../../MantineProvider';
import type { MantineStyleProp } from '../../Box';
import { StylesRecord } from '../styles-api.types';

type Styles<StylesNames extends string> =
  | StylesRecord<StylesNames, CSSProperties>
  | ((theme: MantineTheme) => StylesRecord<StylesNames, CSSProperties>);

export interface UseStylesApiInput<StylesNames extends string> {
  name: string | string[];
  classes: Record<StylesNames, string>;
  className?: string;
  style?: MantineStyleProp;
  rootSelector?: StylesNames;
  unstyled?: boolean;
  classNames?: Partial<Record<StylesNames, string>>;
  styles?: Styles<StylesNames>;
}

function resolveStyles<StylesNames extends string>(
  styles: Styles<StylesNames> | undefined,
  theme: MantineTheme
) {
  return typeof styles === 'function' ? styles(theme) : styles;
}

export function useStylesApi<StylesNames extends string>({
  name,
  className,
  classes,
  style,
  rootSelector = 'root' as StylesNames,
  unstyled,
  classNames,
  styles,
}: UseStylesApiInput<StylesNames>) {
  const theme = useMantineTheme();
  const classNamesPrefix = useMantineClassNamesPrefix();
  const themeName = Array.isArray(name) ? name : [name];
  const resolvedStyles = resolveStyles(styles, theme);
  const _resolvedStyle = Array.isArray(style) ? style : [style];
  const resolvedStyle = _resolvedStyle.reduce(
    (acc, val) => ({ ...acc, ...(typeof val === 'function' ? val(theme) : val) }),
    {}
  );

  return (selector: StylesNames) => {
    const themeClassNames = themeName.map((n) => theme.components?.[n]?.classNames?.[selector]);
    const staticClassNames = themeName.map((n) => `${classNamesPrefix}-${n}-${selector}`);
    const _className = cx(
      themeClassNames,
      classNames?.[selector],
      className && { [className]: rootSelector === selector },
      { [classes[selector]]: !unstyled },
      staticClassNames
    );

    const themeStyles = themeName
      .map((n) => resolveStyles(theme.components?.[n]?.styles, theme)?.[selector])
      .reduce((acc, val) => ({ ...acc, ...val }), {});

    const _style = {
      ...themeStyles,
      ...resolvedStyles?.[selector],
      ...resolvedStyle,
    } as CSSProperties;

    return { className: _className, style: _style };
  };
}
