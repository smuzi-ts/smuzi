import { Option, Some, None } from "./option.ts";

type ExtractMatchResult = {
  res: boolean,
  data: Option<Record<string, string> | string[]>,
};

export function matchRegExp(v: string, p: RegExp): ExtractMatchResult {
    const match = v.match(p);
    if (!match) return { res: false, data: None() }

    if (match.groups) {
        return { res: true, data: Some(match.groups) }
    }

    return { res: true, data: Some(match.slice(1)) }
}