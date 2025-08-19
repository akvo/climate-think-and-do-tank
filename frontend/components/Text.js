import React from 'react';
const { cn } = require('@/helpers/utilities');

const textStyles = {
  paragraph: {
    regular: 'text-base font-assistant font-normal',
    bold: 'text-base font-assistant font-bold',
    size: 'text-[16px] md:text-[18px]',
    lineHeight: 'leading-[22px] md:leading-[25px]',
    tracking: 'tracking-[-0.025em]',
  },
  paragraphMD: {
    regular: 'text-base font-assistant font-normal',
    bold: 'text-base font-assistant font-bold',
    size: 'text-[16px]',
    lineHeight: 'leading-[22px]',
    tracking: 'tracking-[-0.025em]',
  },
  paragraphSM: {
    regular: 'text-sm font-assistant font-normal',
    bold: 'text-sm font-assistant font-bold',
    size: 'text-[14px]',
    lineHeight: 'leading-[19px]',
    tracking: 'tracking-[-0.025em]',
  },
  link: {
    regular: 'text-sm font-assistant font-normal underline cursor-pointer',
    bold: 'text-sm font-assistant font-bold underline cursor-pointer',
    size: 'text-[14px] md:text-[15px]',
    lineHeight: 'leading-[19px] md:leading-[20px]',
    tracking: 'tracking-[-0.025em]',
  },
};

export const Text = ({
  variant = 'paragraph',
  weight = 'regular',
  children,
  className = '',
  as = 'p',
  ...props
}) => {
  const Component = as;
  const styles = textStyles[variant];

  if (!styles) {
    console.warn(`Invalid text variant: ${variant}`);
    return null;
  }

  const baseClasses = styles[weight] || styles.regular;
  const lineHeightClasses = styles.lineHeight;
  const trackingClasses = styles.tracking;

  return (
    <Component
      className={cn(
        baseClasses,
        lineHeightClasses,
        trackingClasses,
        'text-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export const Paragraph = (props) => <Text variant="paragraph" {...props} />;
export const ParagraphMD = (props) => <Text variant="paragraphMD" {...props} />;
export const ParagraphSM = (props) => <Text variant="paragraphSM" {...props} />;
export const Link = (props) => <Text variant="link" as="a" {...props} />;
