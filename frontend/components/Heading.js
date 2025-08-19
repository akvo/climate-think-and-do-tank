import React from 'react';
import { cn } from '@/helpers/utilities';

const headingStyles = {
  h1: {
    regular: 'text-[48px] md:text-[64px] font-roboto-slab font-normal',
    bold: 'text-[48px] md:text-[64px] font-roboto-slab font-bold',
    lineHeight: 'leading-[56px] md:leading-[68px]',
    tracking: 'tracking-[-0.02em]',
  },
  h2: {
    regular: 'text-[36px] md:text-[48px] font-roboto-slab font-normal',
    bold: 'text-[36px] md:text-[48px] font-roboto-slab font-bold',
    lineHeight: 'leading-[44px] md:leading-[56px]',
    tracking: 'tracking-[-0.02em]',
  },
  h3: {
    regular: 'text-[32px] md:text-[36px] font-roboto-slab font-normal',
    bold: 'text-[32px] md:text-[36px] font-roboto-slab font-bold',
    lineHeight: 'leading-[40px] md:leading-[44px]',
    tracking: 'tracking-[-0.02em]',
  },
  h4: {
    regular: 'text-[24px] md:text-[32px] font-roboto-slab font-normal',
    bold: 'text-[24px] md:text-[32px] font-roboto-slab font-bold',
    lineHeight: 'leading-[32px] md:leading-[40px]',
    tracking: 'tracking-[0]',
  },
  h5: {
    regular: 'text-[20px] md:text-[24px] font-roboto-slab font-normal',
    bold: 'text-[20px] md:text-[24px] font-roboto-slab font-bold',
    lineHeight: 'leading-[28px] md:leading-[32px]',
    tracking: 'tracking-[-0.025em]',
  },
};

const Heading = ({
  level = 'h1',
  variant = 'regular',
  children,
  className = '',
  as,
  ...props
}) => {
  const Component = as || level;
  const styles = headingStyles[level];

  if (!styles) {
    console.warn(`Invalid heading level: ${level}`);
    return null;
  }

  const baseClasses = styles[variant] || styles.regular;
  const lineHeightClasses = styles.lineHeight;
  const trackingClasses = styles.tracking;

  return (
    <Component
      className={cn(
        baseClasses,
        lineHeightClasses,
        trackingClasses,
        'text-gray-1000',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export const H1 = ({ variant = 'regular', ...props }) => (
  <Heading level="h1" variant={variant} {...props} />
);

export const H2 = ({ variant = 'regular', ...props }) => (
  <Heading level="h2" variant={variant} {...props} />
);

export const H3 = ({ variant = 'regular', ...props }) => (
  <Heading level="h3" variant={variant} {...props} />
);

export const H4 = ({ variant = 'regular', ...props }) => (
  <Heading level="h4" variant={variant} {...props} />
);

export const H5 = ({ variant = 'regular', ...props }) => (
  <Heading level="h5" variant={variant} {...props} />
);

export default Heading;
