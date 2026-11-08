import { useSearchParams } from "react-router";

import { parsePosition } from "../types";

export function useUrlPosition(): [number, number] | [null, null] {
  const [parameters] = useSearchParams();
  const position = parsePosition(parameters.get("lat"), parameters.get("lng"));
  return position ? [position.lat, position.lng] : [null, null];
}
