import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border bg-white shadow-sm p-4 ${className}`}
      {...props}
    />
  );
}

export function CardContent({ className = "", ...props }: ContentProps) {
  return (
    <div className={`mt-4 ${className}`} {...props} />
  );
}
