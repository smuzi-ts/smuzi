import { Option, Some, None } from "./option.ts";

type ExtractMatchResult = Option<Record<string, string> | string[]>;

function extractMatch(input: string, regex: RegExp): ExtractMatchResult {
  const match = input.match(regex);

  if (! match) return None();

  if (match.groups) {
    return Some(match.groups);
  }

  return Some(match.slice(1));
}