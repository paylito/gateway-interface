import type { JSX, CSSProperties } from "react";

type BoxProps = {
  children: JSX.Element | JSX.Element[];
  style?: CSSProperties;
  className?: string;
};

const Box = ({ children, style, className }: BoxProps) => {
  return (
    <div
      className={`bg-white rounded-[24px] ${className ?? ""}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Box;
