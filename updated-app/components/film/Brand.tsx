import Image from "next/image";

// The eyebrow for a work scene: the company's mark, its name, and when.
// Larger than a plain eyebrow so the company reads first.
export default function Brand({
  logo,
  name,
  meta,
  invert = false,
}: {
  logo: string;
  name: string;
  meta: string;
  invert?: boolean;
}) {
  return (
    <p className="reveal flex flex-wrap items-center gap-x-3 gap-y-1 text-[clamp(20px,1.9vw,28px)] font-semibold leading-tight tracking-[-0.012em]">
      <Image
        src={logo}
        alt=""
        width={40}
        height={40}
        className={`size-[1.35em] shrink-0 object-contain ${invert ? "invert" : ""}`}
      />
      <span>{name}</span>
      {/* On phones the details drop to their own line, without a leading dot. */}
      <span className="basis-full text-[0.82em] font-medium text-mute sm:basis-auto sm:text-[1em]">
        <span className="hidden sm:inline">· </span>
        {meta}
      </span>
    </p>
  );
}
