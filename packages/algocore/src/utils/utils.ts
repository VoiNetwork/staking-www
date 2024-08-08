import { ZERO_ADDRESS_STRING } from "../constants";

export function microToAlgo(n: any) {
  return n / 1e6;
}

export function isZeroAddress(address: string): boolean {
  return address === ZERO_ADDRESS_STRING;
}
