import Link from "next/link";
import { Logo } from "@/components/icons";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-5 py-8">
      <Link href="/" aria-label="YabaSafe home" className="self-start">
        <Logo />
      </Link>
      {children}
    </div>
  );
}
