import { ComplaintForm } from "@/components/public/complaint-form";

export default function GunasoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">गुनासो दर्ता गर्नुहोस्</h1>
      <p className="mt-2 text-sm text-gray-600">
        कृपया तलको फारम भरेर आफ्नो गुनासो पेश गर्नुहोस्। सबमिट गरेपछि तपाईंलाई एउटा ट्र्याकिङ कोड दिइनेछ।
      </p>
      <div className="mt-8">
        <ComplaintForm />
      </div>
    </div>
  );
}
