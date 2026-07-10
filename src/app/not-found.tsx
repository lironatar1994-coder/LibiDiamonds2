import Link from "next/link";
import { HeroDiamond } from "@/components/JewelryArt";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <HeroDiamond className="mx-auto w-48 opacity-60" />
      <h1 className="mt-8 font-display text-3xl font-medium">
        העמוד הזה לא נמצא
      </h1>
      <p className="mt-4 text-stone">
        אבל יהלומים יפים מחכים בעמודים אחרים.
      </p>
      <Link href="/" className="btn-primary mt-8">
        חזרה לעמוד הבית
      </Link>
    </div>
  );
}
