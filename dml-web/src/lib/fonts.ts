import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";

export const gtAmerica = localFont({
  src: "../fonts/GTAmerica-ExtendedBold.woff2",
  variable: "--font-gt-america",
  display: "swap",
  weight: "700",
});

export const satoshi = localFont({
  src: "../fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  display: "swap",
  weight: "300 900",
});

export const geistMono = GeistMono;

export const fontVariables = [
  gtAmerica.variable,
  satoshi.variable,
  geistMono.variable,
].join(" ");
