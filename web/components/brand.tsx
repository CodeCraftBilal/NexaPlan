import Link from "next/link";

export function Brand({
  href = "/",
  compact = false,
}: {
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="ProjectAI home"
      className="inline-flex shrink-0 items-center gap-2.5"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-[#19220d]">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="m12 2 9 5-9 5-9-5 9-5Z" fill="currentColor" />
          <path
            d="m3 12 9 5 9-5M3 17l9 5 9-5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className="text-lg font-semibold tracking-[-0.6px]">
          Project<span className="text-primary">AI</span>
          <span className="ml-1.5 align-top text-[9px] font-normal tracking-normal text-zinc-500">
            BETA
          </span>
        </span>
      )}
    </Link>
  );
}
