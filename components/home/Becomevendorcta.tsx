import Link from "next/link";
import { FiShield, FiPackage, FiUsers } from "react-icons/fi";

const benefits = [
  {
    icon: FiUsers,
    title: "Reach ready-to-buy shoppers",
    text: "List your products in front of the customers already shopping on Dawang Hub.",
  },
  {
    icon: FiShield,
    title: "Get paid securely",
    text: "Payments are held safely and released to you once your customer confirms delivery.",
  },
  {
    icon: FiPackage,
    title: "Run your store from one dashboard",
    text: "Add products, manage orders and track your earnings in one place.",
  },
];

export default function BecomeVendorCta() {
  return (
    <section
      aria-labelledby="become-vendor-heading"
      className="bg-[#151413] px-4 py-14 text-white sm:px-6 sm:py-20"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-5">
          <h3
            id="become-vendor-heading"
            className="font-heading text-2xl font-bold leading-tight sm:text-4xl"
          >
            Sell your products on Dawang Hub
          </h3>
          <p className="max-w-md text-sm leading-relaxed text-[#B9B4AE]">
            Open your own store, list your products and start selling to
            customers across the marketplace. It takes a few minutes to apply.
          </p>
          <Link
            href="/vendor/setup"
            className="mt-2 inline-flex items-center justify-center bg-[#C4956A] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[#151413] transition-colors hover:bg-[#D4A67B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Become a vendor
          </Link>
        </div>

        <ul className="flex flex-col divide-y divide-white/10 border-y border-white/10">
          {benefits.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4 py-5">
              <Icon
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-[#C4956A]"
              />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#B9B4AE]">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
