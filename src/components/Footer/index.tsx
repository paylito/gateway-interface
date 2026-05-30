import { useEffect, useState } from "react";

function useMinHeight(minHeight: number) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(min-height: ${minHeight}px)`);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, [minHeight]);

  return matches;
}

const Footer = () => {
  const isTallEnough = useMinHeight(850);

  // Hide the footer on short viewports so it never overlaps the content.
  if (!isTallEnough) return null;

  return (
    <div className="xl:flex hidden justify-center items-center fixed bottom-[34px] left-1/2 -translate-x-1/2 gap-1">
      <img src="/public/assets/shield.svg" className="w-5 h-5" />
      Secured by
      <div className="flex items-center justify-center">
        <img
          src="/public/assets/payli_medium.svg"
          className="w-[18.5px] h-[22px]"
        />
        <img
          src="/public/assets/payli_logotype.svg"
          className="w-[60px] h-[22px]"
        />
      </div>
    </div>
  );
};

export default Footer;
