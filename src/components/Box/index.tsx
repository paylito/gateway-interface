import type { JSX } from "react";

type BoxProps = {
  children: JSX.Element | JSX.Element[];
  style?: Record<string, string>;
  className?: string;
};

const Box = ({ children, style, className }: BoxProps) => {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "white",
        borderRadius: "24px",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Box;
