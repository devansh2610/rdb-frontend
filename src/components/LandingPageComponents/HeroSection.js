import React from "react";
import { Link as ScrollLink } from "react-scroll";

// Color palette from screenshot
const green = "#00C389"; // for arrow, "Building Blocks"
const yellow = "#D9FF5B"; // for "of Food.", "Sustainability."
const white = "#fff";
const black = "#18191A"; // backdrop
const outline = "#fff";
const fontMono = "'JetBrains Mono', 'Fira Mono', 'Menlo', 'monospace'";

export default function HeroSection() {
  return (
    <section className="w-full h-screen bg-[#1D1D1D] flex items-center justify-center px-2 sm:px-4 pt-20 pb-6">
      <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 mx-auto relative">
        {/* Left: Text and blocks */}
        <div className="flex-1 flex flex-col items-start md:items-start justify-center max-w-xl w-full z-10 mb-8 md:mb-0">
          {/* Top arrow in circle */}
          <div className="mb-4 flex w-full justify-center md:justify-start">
            <span className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full" style={{ background: yellow }}>
              <img src="/arrow01.svg" alt="arrow up right" className="w-8 h-8 sm:w-9 sm:h-9" />
            </span>
          </div>
          {/* Main text blocks */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 w-full justify-center md:justify-start">
            <span style={{ fontFamily: fontMono, fontWeight: 700, color: white, border: `2px solid ${outline}` }} className="text-lg sm:text-2xl px-3 sm:px-5 py-1 sm:py-1.5 rounded-full bg-transparent">Digital</span>
            <div className="flex items-center gap-2 sm:gap-3 flex-nowrap">
              <span style={{ background: green, color: black, fontWeight: 600 }} className="text-lg sm:text-2xl px-3 sm:px-5 py-1 sm:py-1.5 rounded-full">Building Blocks</span>
              <span style={{ background: yellow, color: black, fontWeight: 600 }} className="text-lg sm:text-2xl px-3 sm:px-5 py-1 sm:py-1.5 rounded-full">of Food.</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 w-full justify-center md:justify-start">
            
            <span style={{ fontFamily: fontMono, fontWeight: 700, color: white, border: `2px solid ${outline}` }} className="text-lg sm:text-2xl px-3 sm:px-5 py-1 sm:py-1.5 rounded-full bg-transparent">Recipe.</span>
            <span style={{ fontFamily: fontMono, fontWeight: 700, color: white, border: `2px solid ${outline}` }} className="text-lg sm:text-2xl px-3 sm:px-5 py-1 sm:py-1.5 rounded-full bg-transparent">Flavor.</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 w-full justify-center md:justify-start">
            <span style={{ fontFamily: fontMono, fontWeight: 700, color: white, border: `2px solid ${outline}` }} className="text-lg sm:text-2xl px-3 sm:px-5 py-1 sm:py-1.5 rounded-full bg-transparent">Nutrition.</span>
            <span style={{ fontFamily: fontMono, fontWeight: 700, color: white, border: `2px solid ${outline}` }} className="text-lg sm:text-2xl px-3 sm:px-5 py-1 sm:py-1.5 rounded-full bg-transparent">Health.</span>
            <span className="inline-flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-none ml-1 sm:ml-2">
              <img src="/arrow02.svg" alt="arrow up right" className="w-7 h-7 sm:w-10 sm:h-10" style={{ filter: `brightness(0) saturate(100%) invert(62%) sepia(99%) saturate(749%) hue-rotate(97deg) brightness(97%) contrast(101%)` }} />
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 w-full justify-center md:justify-start">
            <span style={{ fontFamily: fontMono, fontWeight: 700, color: white, border: `2px solid ${outline}` }} className="text-lg sm:text-2xl px-3 sm:px-5 py-1 sm:py-1.5 rounded-full bg-transparent">&amp;</span>
            <span style={{ background: yellow, color: black, fontWeight: 600 }} className="text-lg sm:text-2xl px-3 sm:px-5 py-1 sm:py-1.5 rounded-full">Sustainability.</span>
          </div>
          {/* Subtext */}
          <p
  style={{ fontFamily: fontMono, color: white }}
  className="text-xs sm:text-base md:text-lg mb-6 mt-2 opacity-90 text-center md:text-left w-full"
>
  Computational Gastronomy APIs for&nbsp;
  <span className="hidden sm:inline">
    recipes, flavors, nutrition, health and sustainability
  </span>
  <span className="sm:hidden">
    <br />
    recipes, flavors, nutrition, health and sustainability
  </span>
</p>

          {/* Button */}
          <div className="w-full flex justify-center md:justify-start">
            <ScrollLink to="explore" offset={-87} smooth={true}>
              <button
                type="button"
                className="bg-[#04c389] hover:bg-[#02a06e] text-[#232323] font-semibold rounded-full px-5 sm:px-6 py-2 text-sm sm:text-base shadow transition-colors duration-200"
              >
                Explore APIs
              </button>
            </ScrollLink>
          </div>
        </div>
        {/* Right: Illustration with glow */}
        <div className="flex-1 flex items-center justify-center w-full max-w-2xl relative">
          {/* Glow backdrop with new color #D9FF5B */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] xs:w-[340px] xs:h-[340px] sm:w-[420px] sm:h-[420px] md:w-[600px] md:h-[600px] rounded-full z-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle, #D9FF5B88 0%, #D9FF5B44 30%, transparent 100%)`,
              filter: 'blur(60px)',
            }}
          />
          <img
            src="/hero-assest01.svg"
            alt="API ecosystem illustration"
            className="w-full h-auto max-w-[220px] xs:max-w-[300px] sm:max-w-[400px] md:max-w-[600px] lg:max-w-[720px] drop-shadow-xl relative z-10"
            draggable="false"
          />
        </div>
      </div>
    </section>
  );
}
