import Link from "next/link";
import { FileText, Search, ShieldCheck, Clock } from "lucide-react";

export default function PublicHomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-white">
        {/* Faint bell watermark, decorative only */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/rsp-logo-icon.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-10 h-72 w-72 opacity-[0.06]"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
            <div className="order-1 flex justify-center md:justify-start">
              <div className="relative w-full max-w-xs sm:max-w-sm">
                {/* Blob sized/positioned relative to the photo itself so it stays tucked
                    behind it at every viewport size, instead of a fixed-size shape that
                    drifts away from the photo's actual silhouette. */}
                <div
                  aria-hidden
                  className="absolute left-1/2 top-[38%] -z-10 h-[78%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/rsp_banner.svg"
                  alt="राष्ट्रिय स्वतन्त्र पार्टी, चितवन"
                  className="relative z-10 h-auto w-full"
                />
              </div>
            </div>
            <div className="order-2">
              <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                तपाईंको <span className="text-primary">गुनासो</span>, हाम्रो जिम्मेवारी
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
                निर्माण आयोजनासँग सम्बन्धित कुनै समस्या वा गुनासो छ भने सजिलैसँग अनलाइन दर्ता गर्नुहोस् र
                ट्र्याकिङ कोडको माध्यमबाट यसको प्रगति हेर्नुहोस्।
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/gunaso"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover"
                >
                  <FileText className="h-4 w-4" />
                  गुनासो दर्ता गर्नुहोस्
                </Link>
                <Link
                  href="/gunaso/track"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Search className="h-4 w-4" />
                  गुनासो ट्र्याक गर्नुहोस्
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-semibold text-gray-900">यो कसरी काम गर्छ?</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={FileText}
              title="गुनासो दर्ता गर्नुहोस्"
              description="आफ्नो नाम, ठेगाना, विवरण र प्रमाणसहित गुनासो अनलाइन दर्ता गर्नुहोस्।"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="ट्र्याकिङ कोड प्राप्त गर्नुहोस्"
              description="दर्ता पछि ५ अङ्क/अक्षरको एक विशेष कोड प्राप्त हुनेछ, यसलाई सुरक्षित राख्नुहोस्।"
            />
            <FeatureCard
              icon={Clock}
              title="प्रगति हेर्नुहोस्"
              description="जुनसुकै बेला ट्र्याकिङ कोड प्रयोग गरेर आफ्नो गुनासोको स्थिति र टिप्पणीहरू हेर्नुहोस्।"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}
