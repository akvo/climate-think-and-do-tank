import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check } from 'lucide-react';
import { ParagraphMD } from './Text';

export const MarkdownRenderer = ({ content, components = {} }) => {
  // Preprocess content to handle literal \n\n and \n in text
  const processedContent = content
    ?.replaceAll('\\n\\n', '\n\n')
    .replaceAll('\\n', '\n')
    .replaceAll(' \\n\\n ', '\n\n')
    .replaceAll(' \\n ', '\n');

  const defaultComponents = {
    a: ({ node, ...props }) => {
      const isSignup = props.href === '/signup';
      return (
        <a
          {...props}
          target={isSignup ? undefined : '_blank'}
          rel={isSignup ? undefined : 'noopener noreferrer'}
          className="text-blue-600 hover:underline"
        />
      );
    },
    h1: ({ node, ...props }) => (
      <h1 {...props} className="text-2xl font-bold mt-4 mb-2" />
    ),
    h2: ({ node, ...props }) => (
      <h2 {...props} className="text-xl font-semibold mt-3 mb-2" />
    ),
    h3: ({ node, ...props }) => (
      <h3 {...props} className="text-lg font-semibold mt-2 mb-1" />
    ),
    p: ({ node, ...props }) => <ParagraphMD {...props} className="mb-6" />,
    br: () => <br className="block my-4" />,
    ul: ({ node, ...props }) => <ul {...props} className="space-y-3 mb-4" />,
    li: ({ node, children, ...props }) => (
      <li className="flex items-start gap-3" {...props}>
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center mt-0.5">
          <Check className="w-4 h-4 text-primary-500" />
        </span>
        <span className="text-gray-700">{children}</span>
      </li>
    ),
    ol: ({ node, ...props }) => (
      <ol {...props} className="list-decimal pl-5 mb-4" />
    ),
    code: ({ node, ...props }) => (
      <code
        {...props}
        className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono"
      />
    ),
    pre: ({ node, ...props }) => (
      <pre
        {...props}
        className="bg-gray-100 rounded p-4 overflow-x-auto mb-4"
      />
    ),
    ...components,
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={defaultComponents}>
      {processedContent}
    </ReactMarkdown>
  );
};
