import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Select, {
  components,
  type DropdownIndicatorProps,
  type MenuProps,
  type OptionProps,
  type PlaceholderProps,
  type SingleValueProps,
  type StylesConfig,
} from "react-select";

type IOption = {
  value: string;
  label: string;
  logo: string;
};

type CSelectProps = {
  title: string;
  placeholder: string;
};

const networkOptions: IOption[] = [
  {
    value: "ethereum",
    label: "Ethereum (ERC20)",
    logo: "/public/assets/eth.svg",
  },
  {
    label: "Binance",
    value: "bsc",
    logo: "/public/assets/bsc.svg",
  },
  {
    value: "arbitrum",
    label: "Arbitrum",
    logo: "/public/assets/arbitrum.svg",
  },
  {
    value: "base",
    label: "Base",
    logo: "/public/assets/base.svg",
  },
  {
    value: "optimism",
    label: "Optimism",
    logo: "/public/assets/optimism.svg",
  },
];

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
        src="/public/assets/question_mark.svg"
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
        src="/public/assets/arrow_down.svg"
        style={{ width: 24, height: 24 }}
      />
    </components.DropdownIndicator>
  );
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

function SingleValue<Option extends IOption, IsMulti extends boolean>(
  props: SingleValueProps<Option, IsMulti>,
) {
  const { data } = props;

  return (
    <components.SingleValue {...props}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <img src={data.logo} className="w-[32px] h-[32px]" />

        <span>{data.label}</span>
      </div>
    </components.SingleValue>
  );
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

            <span style={{ fontSize: 18 }}>{data.label}</span>
          </div>

          {isSelected ? (
            <img
              src="/public/assets/done.svg"
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

export default function CSelect({ title, placeholder }: CSelectProps) {
  const [selected, setSelected] = useState<IOption | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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

  function Menu<Option, IsMulti extends boolean, Group>(
    props: MenuProps<Option, IsMulti, Group>,
  ) {
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
            pointerEvents: "none",
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
                  color: "#6B7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              ></button>

              <img
                src="/public/assets/close_black.svg"
                style={{ width: 24, height: 24 }}
              />
            </div>

            <div style={{ flex: "1 1 auto", overflow: "hidden" }}>
              {props.children}
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <div>
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
        value={selected}
        onChange={(value) => {
          setSelected(value);
          setMenuOpen(false);
        }}
        onMenuOpen={() => setMenuOpen(true)}
        onMenuClose={() => setMenuOpen(false)}
        menuIsOpen={menuOpen}
        options={networkOptions}
        placeholder="Choose network"
        isSearchable={false}
        isClearable={false}
        closeMenuOnSelect
        blurInputOnSelect
        menuPlacement="bottom"
        styles={styles}
        className="w-[325px]"
        components={{
          Placeholder: PlaceholderMaker(placeholder),
          SingleValue,
          Option,
          DropdownIndicator,
          IndicatorSeparator: () => null,
          Menu,
        }}
      />
    </div>
  );
}
