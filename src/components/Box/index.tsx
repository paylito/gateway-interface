import type { ReactNode, CSSProperties } from "react";

type BoxProps = {
  children: ReactNode;
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
