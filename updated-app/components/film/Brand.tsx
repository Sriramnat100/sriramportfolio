import Image from "next/image";

// The eyebrow for a work scene: the company's mark, its name, the role, and
// when. Larger than a plain eyebrow so the company reads first.
export default function Brand({
  logo,
  name,
  meta,
  invert = false,
}: {
  logo: string;
  name: string;
  meta: string[];
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
      {/* On phones and small tablets the details drop below the name, one
          per line, without the dots. */}
      <span className="basis-full text-[0.82em] font-medium text-mute md:basis-auto md:text-[1em]">
        {meta.map((m) => (
          <span key={m} className="block md:inline">
            <span className="hidden md:inline">· </span>
            {m}{" "}
          </span>
        ))}
      </span>
    </p>
  );
}
