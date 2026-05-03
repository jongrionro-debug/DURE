import Image from "next/image";

export function BrandMark({
  className = "h-[48px] w-[52px]",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative shrink-0 overflow-hidden ${className}`}>
      <Image
        src="/figma-assets/login-brand-mark.png"
        alt=""
        width={1536}
        height={1024}
        priority={priority}
        className="absolute max-w-none"
        style={{
          height: "186.67%",
          left: "-62.17%",
          top: "-35.24%",
          width: "223.57%",
        }}
      />
    </div>
  );
}
