import Link from "next/link";
import Image from "next/image";

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
        <Image src="/logo.svg" alt="NexaPlan Logo" width={20} height={20} />
      </span>
      {!compact && (
        <span className="text-lg font-semibold tracking-[-0.6px]">
          Nexa<span className="text-primary">Plan</span>
        </span>
      )}
    </Link>
  );
}
