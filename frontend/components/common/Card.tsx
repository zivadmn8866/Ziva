
import React from 'react';

// Fix: Update CardProps to extend standard div attributes, allowing props like `onClick`.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
