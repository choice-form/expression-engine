import type { NativeDoc } from "@/editor/types";
import { arrayMethods } from "./array-method";
import { booleanMethods } from "./boolean-method";
import { numberMethods } from "./number-method";
import { objectMethods } from "./object-method";
import { stringMethods } from "./string-methods";

export const NATIVE_METHODS: NativeDoc[] = [
  stringMethods,
  arrayMethods,
  numberMethods,
  objectMethods,
  booleanMethods,
];
