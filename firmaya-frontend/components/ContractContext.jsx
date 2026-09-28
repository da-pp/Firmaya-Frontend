"use client";

import { createContext, useContext } from "react";

const ContractContext = createContext(null);

export const ContractProvider = ContractContext.Provider;

export function useContract() {
  return useContext(ContractContext);
}
