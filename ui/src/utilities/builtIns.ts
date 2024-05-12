export const getBuiltIn = <K extends keyof Window>(name: K): Window[K] =>
  window[name];
