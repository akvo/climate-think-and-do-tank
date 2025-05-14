import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const MarkdownRenderer = ({ content, components = {} }) => {
  const defaultComponents = {
    a: ({ node, ...props }) => (
      <a
        {...props}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      />
    ),
    h1: ({ node, ...props }) => (
      <h1 {...props} className="text-2xl font-bold mt-4 mb-2" />
    ),
    h2: ({ node, ...props }) => (
      <h2 {...props} className="text-xl font-semibold mt-3 mb-2" />
    ),
    h3: ({ node, ...props }) => (
      <h3 {...props} className="text-lg font-semibold mt-2 mb-1" />
    ),
    p: ({ node, ...props }) => <p {...props} className="mb-4" />,
    ul: ({ node, ...props }) => (
      <ul {...props} className="list-disc pl-5 mb-4" />
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
      {content}
    </ReactMarkdown>
  );
};
