import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const loginIdState = atomWithStorage("loginIdState", "", sessionStorage);
export const loginLevelState = atomWithStorage("loginLevelState", "", sessionStorage);
export const accessTokenState = atomWithStorage("accessTokenState", "", sessionStorage);
export const refreshTokenState= atomWithStorage("refreshTokenState", "", sessionStorage);