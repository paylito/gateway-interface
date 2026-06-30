import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Select, {
  components,
  type ControlProps,
  type DropdownIndicatorProps,
  type GroupBase,
  type MenuProps,
  type OptionProps,
  type PlaceholderProps,
  type SingleValueProps,
  type StylesConfig,
} from "react-select";

export type IOption = {
  value: string;
  label: string;
  name: string;
  symbol?: string;
  logo: string;
  /** For network options: list of token values supported on this network. */
  tokens?: string[];
};

type CSelectProps = {
  title: string;
  options: IOption[];
  placeholder: string;
  value: IOption | null;
  onChange: (o: IOption | null) => void;
  /**
   * When true, the selected value renders compactly (logo + symbol only),
   * used for tokens. When false, the full name (with symbol in parens, if
   * present) is shown, used for networks.
   */
  compactValue?: boolean;
};

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}

function QuestionMarkBadge() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 9999,
        background: "#E5E7EB",
        color: "#6B7280",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <img
        src="/assets/question_mark.svg"
        style={{ width: 24, height: 24 }}
      />
    </div>
  );
}

function DropdownIndicator<Option, IsMulti extends boolean>(
  props: DropdownIndicatorProps<Option, IsMulti>,
) {
  return (
    <components.DropdownIndicator {...props}>
      <img
        src="/assets/arrow_down.svg"
        style={{ width: 24, height: 24 }}
      />
    </components.DropdownIndicator>
  );
}

function IndicatorSeparator() {
  return null;
}

function PlaceholderMaker(placeHolder: string) {
  function Placeholder<Option, IsMulti extends boolean>(
    props: PlaceholderProps<Option, IsMulti>,
  ) {
    return (
      <components.Placeholder {...props}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <QuestionMarkBadge />

          <span style={{ fontSize: 18 }}>{placeHolder}</span>
        </div>
      </components.Placeholder>
    );
  }

  return Placeholder;
}

function SingleValueMaker(compact: boolean) {
  function SingleValue<Option extends IOption, IsMulti extends boolean>(
    props: SingleValueProps<Option, IsMulti>,
  ) {
    const { data } = props;

    return (
      <components.SingleValue {...props}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src={data.logo} className="w-[32px] h-[32px]" />

          {compact ? (
            <span>{data.symbol ?? data.name}</span>
          ) : (
            <span>
              {data.name}
              {data.symbol ? ` (${data.symbol})` : ""}
            </span>
          )}
        </div>
      </components.SingleValue>
    );
  }

  return SingleValue;
}

function Option<Option extends IOption, IsMulti extends boolean>(
  props: OptionProps<Option, IsMulti>,
) {
  const { data, isSelected, options } = props;

  const isLast = options[options.length - 1] === data;

  return (
    <>
      <components.Option {...props}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "0 1px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <img src={data.logo} className="w-[24px] h-[24px]" />

            <span style={{ fontSize: 18 }}>
              <span style={{ color: "#000000" }}>{data.name}</span>
              {data.symbol ? (
                <span style={{ color: "#636363" }}> ({data.symbol})</span>
              ) : null}
            </span>
          </div>

          {isSelected ? (
            <img
              src="/assets/done.svg"
              style={{ width: 20, height: 20 }}
            />
          ) : (
            <span style={{ width: 16, height: 16 }} />
          )}
        </div>
      </components.Option>

      {!isLast && (
        <div
          style={{
            paddingLeft: 10,
            paddingRight: 10,
            background: "#FFFFFF",
          }}
        >
          <div
            style={{
              height: 1,
              background: "#E5E7EB",
              width: "100%",
            }}
          />
        </div>
      )}
    </>
  );
}

export default function CSelect({
  title,
  placeholder,
  options,
  value,
  onChange,
  compactValue = false,
}: CSelectProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Track the committed open state so the Control's mousedown handler can
  // decide whether to force the menu open without relying on a stale closure.
  const menuOpenRef = useRef(menuOpen);
  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  const styles: StylesConfig<IOption, false> = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        height: 56,
        borderRadius: 16,
        background: "#FFFFFF",
        border: `2px solid ${state.menuIsOpen ? "#b9b9b9" : "#E4E4E4"}`,
        boxShadow: "none",
        cursor: "pointer",
        transition: "0.15s ease",
        "&:hover": {
          borderColor: "#b9b9b9",
        },
      }),

      valueContainer: (base) => ({
        ...base,
        paddingLeft: 14,
        paddingRight: 10,
      }),

      placeholder: (base) => ({
        ...base,
        margin: 0,
        color: "#9CA3AF",
      }),

      singleValue: (base) => ({
        ...base,
        margin: 0,
        color: "#111827",
      }),

      indicatorSeparator: () => ({
        display: "none",
      }),

      dropdownIndicator: (base) => ({
        ...base,
        color: "#6B7280",
        paddingRight: 14,
      }),

      menu: (base) => ({
        ...base,
        marginTop: isMobile ? 0 : 5,
        overflow: "hidden",
        border: "1px solid #E5E7EB",
        boxShadow: "0 10px 35px rgba(0,0,0,0.12)",
        animation: isMobile ? "none" : "dropdown 0.14s ease",
        zIndex: 20,
        ...(isMobile
          ? {
              position: "static",
              width: "100%",
              border: "none",
              boxShadow: "none",
              marginTop: 0,
              background: "transparent",
            }
          : {
              borderRadius: 16,
            }),
      }),

      menuList: (base) => ({
        ...base,
        padding: 8,
        maxHeight: isMobile ? "calc(55vh - 58px)" : 280,
        overflowY: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: "#C7C7C7 transparent",
        "&::-webkit-scrollbar": {
          width: 6,
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#C7C7C7",
          borderRadius: 9999,
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#A8A8A8",
        },
      }),

      option: (base, state) => ({
        ...base,
        padding: "12px 10px",
        borderRadius: 12,
        background: state.isFocused ? "#F9FAFB" : "#FFFFFF",
        color: "#111827",
        cursor: "pointer",
      }),
    }),
    [isMobile],
  );

  // Force the menu open on any mousedown within the control. react-select
  // handles closing (on outside click / selection), so clicking the control
  // reliably opens it no matter where inside the control you click.
  const Control = useMemo(() => {
    return function ControlComponent<
      Option extends IOption,
      IsMulti extends boolean,
    >(props: ControlProps<Option, IsMulti>) {
      return (
        <div
          onMouseDown={() => {
            if (!menuOpenRef.current) setMenuOpen(true);
          }}
        >
          <components.Control {...props} />
        </div>
      );
    };
  }, []);

  // Memoize the custom react-select components so their function identities stay
  // stable across re-renders. A parent re-render (e.g. the countdown that ticks
  // every second) would otherwise hand react-select brand-new component
  // functions, making it remount the menu and replay its open animation on
  // every tick. (Control / Option / DropdownIndicator are already stable.)
  const Placeholder = useMemo(() => PlaceholderMaker(placeholder), [placeholder]);

  const SingleValue = useMemo(
    () => SingleValueMaker(compactValue),
    [compactValue],
  );

  const Menu = useMemo(() => {
    return function Menu<
      Option,
      IsMulti extends boolean,
      Group extends GroupBase<Option>,
    >(props: MenuProps<Option, IsMulti, Group>) {
      if (!isMobile) {
        return <components.Menu {...props}>{props.children}</components.Menu>;
      }

      if (typeof document === "undefined") return null;

      return createPortal(
        <div>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "stretch",
              background: "rgba(0,0,0,0.35)",
            }}
            onMouseDown={(e) => {
              // Close when tapping the dimmed backdrop.
              if (e.target === e.currentTarget) setMenuOpen(false);
            }}
          >
            <div
              ref={props.innerRef as React.RefObject<HTMLDivElement>}
              {...props.innerProps}
              style={{
                pointerEvents: "auto",
                width: "100%",
                maxHeight: "55vh",
                background: "#FFFFFF",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                boxShadow: "0 -12px 40px rgba(0,0,0,0.16)",
                overflow: "hidden",
                animation: "bottomSheet 0.18s ease",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderBottom: "1px solid #E5E7EB",
                  flex: "0 0 auto",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#111827",
                  }}
                >
                  {placeholder}
                </div>

                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9999,
                    border: "none",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src="/assets/close_black.svg"
                    style={{ width: 24, height: 24 }}
                  />
                </button>
              </div>

              <div style={{ flex: "1 1 auto", overflow: "hidden" }}>
                {props.children}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      );
    };
  }, [isMobile, placeholder]);

  return (
    <div className="w-full">
      <style>{`
        @keyframes dropdown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bottomSheet {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {title && <p style={{ padding: "8px 0", fontWeight: "bold" }}>{title}</p>}

      <Select<IOption, false>
        value={value}
        onChange={(v) => {
          onChange(v);
          setMenuOpen(false);
        }}
        onMenuOpen={() => setMenuOpen(true)}
        onMenuClose={() => setMenuOpen(false)}
        menuIsOpen={menuOpen}
        options={options}
        placeholder={placeholder}
        isSearchable={false}
        isClearable={false}
        closeMenuOnSelect
        menuPlacement="bottom"
        styles={styles}
        className="w-full"
        components={{
          Control,
          Placeholder,
          SingleValue,
          Option,
          DropdownIndicator,
          IndicatorSeparator,
          Menu,
        }}
      />
    </div>
  );
}
