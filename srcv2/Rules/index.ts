import { isAscii } from "./isAscii.rule";
import { isEmail } from "./isEmail.rule";
import { isURL } from "./isURL.rule";
import { required } from "./required.rule";
import { checkType } from "./checkType.rule";
import { matchSchema } from "./matchSchema";

export const rules = {
  required: required,
  type: checkType,
  matchSchema: matchSchema,
  isEmail: isEmail,
  isAscii: isAscii,
  isURL: isURL,
};
