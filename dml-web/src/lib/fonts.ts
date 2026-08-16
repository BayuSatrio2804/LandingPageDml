import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";

export const cabinetGrotesk = localFont({
  src: "../fonts/CabinetGrotesk-Variable.woff2",
  variable: "--font-cabinet-grotesk",
  display: "swap",
  weight: "100 900",
});

export const satoshi = localFont({
  src: "../fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  display: "swap",
  weight: "300 900",
});

export const geistMono = GeistMono;

export const fontVariables = [
  cabinetGrotesk.variable,
  satoshi.variable,
  geistMono.variable,
].join(" ");
