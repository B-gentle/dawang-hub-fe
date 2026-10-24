import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-6">
        <Link href="/" className="flex flex-col items-center gap-0.5">
          <span className="font-heading text-2xl font-bold tracking-[0.2em] text-[#151413]">
            DAWANG
          </span>
          <span className="text-[8px] font-bold tracking-[0.3em] uppercase text-[#C4956A]">
            STORES
          </span>
        </Link>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
