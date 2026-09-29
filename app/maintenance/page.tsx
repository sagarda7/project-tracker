import Image from "next/image";
import { Wrench } from "lucide-react";

export const metadata = {
  title: "Maintenance | राष्ट्रिय स्वतन्त्र पार्टी, चितवन",
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-white to-white px-4 py-12 text-center">
      <Image src="/rsp-logo-icon.svg" alt="" aria-hidden width={72} height={57} priority />
      <div className="mt-6 flex items-center justify-center gap-2 text-primary">
        <Wrench className="h-5 w-5" />
        <span className="text-sm font-semibold uppercase tracking-wide">Maintenance</span>
      </div>
      <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
        हामी हाल केही सुधार गर्दैछौं
      </h1>
      <p className="mt-3 max-w-md text-base text-gray-600">
        यो वेबसाइट अस्थायी रूपमा मर्मत कार्यको लागि बन्द छ। कृपया केही समयपछि फेरि प्रयास गर्नुहोस्।
      </p>
      <p className="mt-1 max-w-md text-sm text-gray-400">
        We&apos;re performing scheduled maintenance. Please check back shortly.
      </p>
    </div>
  );
}
