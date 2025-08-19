import React from 'react';
import { cn } from '@/helpers/utilities';

const textStyles = {
  paragraph: {
    regular: 'text-[16px] md:text-[18px] font-assistant font-normal',
    bold: 'text-[16px] md:text-[18px] font-assistant font-bold',
    lineHeight: 'leading-[22px] md:leading-[25px]',
    tracking: 'tracking-[-0.025px]',
  },
  paragraphMD: {
    regular: 'text-[18px] md:text-[20px] font-assistant font-normal',
    bold: 'text-[18px] md:text-[20px] font-assistant font-bold',
    lineHeight: 'leading-[28px]',
    tracking: 'tracking-[-0.025px]',
  },
  paragraphSM: {
    regular: 'text-[14px] font-assistant font-normal',
    bold: 'text-[14px] font-assistant font-bold',
    lineHeight: 'leading-[19px]',
    tracking: 'tracking-[-0.025px]',
  },
  link: {
    regular:
      'text-[14px] md:text-[15px] font-assistant font-normal underline cursor-pointer',
    bold: 'text-[14px] md:text-[15px] font-assistant font-bold underline cursor-pointer',
    lineHeight: 'leading-[19px] md:leading-[20px]',
    tracking: 'tracking-[-0.025px]',
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
