import ksuid from "ksuid";

export function createId() {
  return ksuid.random().toString();
}
