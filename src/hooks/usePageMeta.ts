import { useEffect } from "react";

const BRAND = "payli";

/**
 * Sets the document <title> and <meta name="description"> for the current
 * screen. This is an SPA, so each screen owns its own metadata at runtime;
 * the description tag is created lazily so index.html needs no placeholder.
 *
 * Nothing is restored on unmount — the next screen always sets its own.
 */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BRAND}` : BRAND;

    let tag = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "description";
      document.head.appendChild(tag);
    }
    tag.content = description;
  }, [title, description]);
}
