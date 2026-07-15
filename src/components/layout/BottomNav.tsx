"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.25em"
      height="1.25em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M7.646 2.561a.5.5 0 0 1 .708 0l5.792 5.793a.5.5 0 0 0 .708-.707L9.06 1.854a1.5 1.5 0 0 0-2.122 0L1.146 7.647a.5.5 0 1 0 .708.707z" />
      <path d="m8 3.622 5.44 5.439.06.057v4.132c0 .69-.56 1.25-1.25 1.25H10a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 0-.5-.5H7a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-.5.5H3.75c-.69 0-1.25-.56-1.25-1.25V9.118l.06-.057z" />
    </svg>
  );
}

function PercentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.25em"
      height="1.25em"
      fill="currentColor"
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <path d="m25.708 7.705-18 18a1 1 0 0 1-1.416-1.415l18-18a1 1 0 0 1 1.415 1.414zM6.317 12.68a4.5 4.5 0 1 1 6.365-6.364 4.5 4.5 0 0 1-6.366 6.364M7 9.5a2.5 2.5 0 1 0 5-.004A2.5 2.5 0 0 0 7 9.5m20 13a4.5 4.5 0 1 1-9-.002 4.5 4.5 0 0 1 9 .002m-2 0a2.5 2.5 0 1 0-5-.001 2.5 2.5 0 0 0 5 .001" />
    </svg>
  );
}

function NotebookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.25em"
      height="1.25em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        stroke="#F5EBDC"
        strokeWidth="0.667"
        d="M2 2.833h12a.67.67 0 0 1 .667.667v9l-.014.13a.67.67 0 0 1-.653.537H2a.667.667 0 0 1-.667-.667v-9A.667.667 0 0 1 2 2.833Zm-.333 10h6.166V3.167H1.667zm6.5 0h6.167V12.5l-.001-9v-.333H8.167zm4.5-2.5v.334H9.833v-.334zm0-2.5v.334H9.833v-.334zm0-2.5v.334H9.833v-.334z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.25em"
      height="1.25em"
      fill="currentColor"
      viewBox="0 0 542 542"
      aria-hidden="true"
    >
      <path d="M457.312 271c0-102.898-83.415-186.312-186.312-186.312S84.688 168.102 84.688 271c0 49.093 18.971 93.736 50.02 127.031C168.7 361.579 217.187 338.75 271 338.75s102.297 22.829 136.29 59.281c31.049-33.295 50.022-77.938 50.022-127.031M271 372.625c-43.764 0-83.22 18.428-111.04 47.997 31.014 23.058 69.419 36.69 111.04 36.69s80.027-13.632 111.04-36.689c-27.821-29.57-67.276-47.998-111.04-47.998m50.812-152.437c0-28.063-22.749-50.813-50.812-50.813s-50.812 22.75-50.812 50.813C220.188 248.25 242.937 271 271 271s50.812-22.75 50.812-50.812M491.188 271c0 65.432-28.564 124.213-73.843 164.52v.001c-38.889 34.614-90.18 55.667-146.345 55.667s-107.454-21.053-146.344-55.667l-.001-.001C79.375 395.213 50.813 336.432 50.813 271c0-121.606 98.581-220.187 220.187-220.187S491.188 149.394 491.188 271m-135.5-50.812c0 46.771-37.916 84.687-84.688 84.687s-84.688-37.916-84.688-84.687S224.228 135.5 271 135.5s84.688 37.916 84.688 84.688" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.25em"
      height="1.25em"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M14.354 9.647 13 8.293V6.5a5.007 5.007 0 0 0-4.5-4.975V.5h-1v1.025A5.007 5.007 0 0 0 3 6.5v1.793L1.646 9.647A.5.5 0 0 0 1.5 10v1.5a.5.5 0 0 0 .5.5h3.5v.388a2.576 2.576 0 0 0 2.25 2.6A2.504 2.504 0 0 0 10.5 12.5V12H14a.5.5 0 0 0 .5-.5V10a.5.5 0 0 0-.146-.354M9.5 12.5a1.5 1.5 0 0 1-3 0V12h3zm4-1.5h-11v-.793l1.354-1.354A.5.5 0 0 0 4 8.5v-2a4 4 0 0 1 8 0v2a.5.5 0 0 0 .146.354l1.354 1.353z" />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-around h-16 px-2">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 pt-1.5 flex-1 min-w-0 transition-colors ${
            pathname === "/" ? "text-primary" : "text-gray-400"
          }`}
        >
          <HomeIcon />
          <span className="text-[10px] font-semibold leading-tight">Inicio</span>
        </Link>

        <Link
          href="/promociones"
          className={`flex flex-col items-center gap-0.5 pt-1.5 flex-1 min-w-0 transition-colors ${
            pathname === "/promociones" ? "text-primary" : "text-gray-400"
          }`}
        >
          <PercentIcon />
          <span className="text-[10px] font-semibold leading-tight">Promos</span>
        </Link>

        <div className="flex flex-col items-center flex-1 min-w-0 relative">
          <Link
            href="/menu"
            className="flex flex-col items-center gap-0.5 absolute -top-3.5"
          >
            <div className="bg-primary rounded-full w-[52px] h-[52px] flex items-center justify-center shadow-lg shadow-primary/30 text-white">
              <NotebookIcon />
            </div>
            <span className="text-[10px] font-semibold leading-tight text-primary">
              Carta
            </span>
          </Link>
        </div>

        <Link
          href="/login"
          className={`flex flex-col items-center gap-0.5 pt-1.5 flex-1 min-w-0 transition-colors ${
            pathname === "/login" ? "text-primary" : "text-gray-400"
          }`}
        >
          <UserIcon />
          <span className="text-[10px] font-semibold leading-tight">Login</span>
        </Link>

        <button
          type="button"
          className="flex flex-col items-center gap-0.5 pt-1.5 flex-1 min-w-0 text-gray-400 transition-colors"
          data-tour="mobile-notifications-button"
        >
          <BellIcon />
          <span className="text-[10px] font-semibold leading-tight">Avisos</span>
        </button>
      </div>
    </nav>
  );
}
