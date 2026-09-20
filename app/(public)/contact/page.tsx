import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">सम्पर्क</h1>
      <p className="mt-4 text-base text-gray-600">
        कुनै जिज्ञासा वा सहयोग चाहिएमा तलका माध्यमहरूबाट सम्पर्क गर्न सक्नुहुन्छ।
      </p>

      <div className="mt-8 space-y-5">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium text-gray-900">ठेगाना</p>
            <p className="text-sm text-gray-600">काठमाडौं, नेपाल</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium text-gray-900">फोन</p>
            <p className="text-sm text-gray-600">०१-४०००००१</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium text-gray-900">इमेल</p>
            <p className="text-sm text-gray-600">support@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
