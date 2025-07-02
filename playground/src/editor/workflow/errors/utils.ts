import type { JsonObject } from "@/editor/types";
import { isTraversableObject } from "../utils";

export const removeCircularRefs = (obj: JsonObject, seen = new Set()) => {
  seen.add(obj);
  Object.entries(obj).forEach(([key, value]) => {
    if (isTraversableObject(value)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      seen.has(value)
        ? (obj[key] = { circularReference: true })
        : removeCircularRefs(value, seen);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((val, index) => {
        if (seen.has(val)) {
          value[index] = { circularReference: true };
          return;
        }
        if (isTraversableObject(val)) {
          removeCircularRefs(val, seen);
        }
      });
    }
  });
};
