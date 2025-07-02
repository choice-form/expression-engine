import xss, { escapeAttrValue } from "xss";
import { ALLOWED_HTML_ATTRIBUTES, ALLOWED_HTML_TAGS } from "../constants";

/**
 * Constants and utility functions that help in HTML, CSS and DOM manipulation
 */
export function sanitizeHtml(dirtyHtml: string) {
  const sanitizedHtml = xss(dirtyHtml, {
    onTagAttr: (tag, name, value) => {
      if (tag === "img" && name === "src") {
        // Only allow http requests to supported image files from the `static` directory
        const isImageFile =
          value.split("#")[0].match(/\.(jpeg|jpg|gif|png|webp)$/) !== null;
        const isStaticImageFile = isImageFile && value.startsWith("/static/");
        if (!value.startsWith("https://") && !isStaticImageFile) {
          return "";
        }
      }

      if (ALLOWED_HTML_ATTRIBUTES.includes(name) || name.startsWith("data-")) {
        // href is allowed but we allow only https and relative URLs
        if (
          name === "href" &&
          !value.match(/^https?:\/\//gm) &&
          !value.startsWith("/")
        ) {
          return "";
        }
        return `${name}="${escapeAttrValue(value)}"`;
      }

      return;
      // Return nothing, means keep the default handling measure
    },
    onTag: (tag) => {
      if (!ALLOWED_HTML_TAGS.includes(tag)) return "";
      return;
    },
  });

  return sanitizedHtml;
}
