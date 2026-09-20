import { TrackComplaintForm } from "@/components/public/track-complaint-form";

export default function TrackGunasoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">गुनासो ट्र्याक गर्नुहोस्</h1>
      <p className="mt-2 text-sm text-gray-600">
        दर्ता गर्दा प्राप्त गरेको ५ अक्षरको ट्र्याकिङ कोड प्रयोग गरेर आफ्नो गुनासोको स्थिति हेर्नुहोस्।
      </p>
      <div className="mt-8">
        <TrackComplaintForm />
      </div>
    </div>
  );
}
