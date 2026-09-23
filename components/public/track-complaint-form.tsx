"use client";

import { useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { ComplaintStatus } from "@prisma/client";
import { trackComplaintAction, getMathCaptchaAction } from "@/lib/actions/complaints";
import type { MathCaptcha } from "@/lib/captcha";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { COMPLAINT_STATUS_BADGE_CLASSES, COMPLAINT_STATUS_LABELS_NE } from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";

interface TrackResult {
  trackingCode: string;
  status: ComplaintStatus;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  notes: { id: string; note: string; createdAt: Date }[];
}

export function TrackComplaintForm({ initialCaptcha }: { initialCaptcha: MathCaptcha }) {
  const [code, setCode] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captcha, setCaptcha] = useState<MathCaptcha>(initialCaptcha);
  const [refreshingCaptcha, setRefreshingCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackResult | null>(null);

  async function refreshCaptcha() {
    setRefreshingCaptcha(true);
    const next = await getMathCaptchaAction();
    setCaptcha(next);
    setCaptchaAnswer("");
    setRefreshingCaptcha(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    const response = await trackComplaintAction(code, {
      a: captcha.a,
      b: captcha.b,
      token: captcha.token,
      answer: Number(captchaAnswer),
    });
    setLoading(false);
    if (!response.success) {
      setError(response.error);
      await refreshCaptcha();
      return;
    }
    setResult(response.data);
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="code">ट्र्याकिङ कोड</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={5}
              placeholder="जस्तै: A7K3M"
              className="uppercase tracking-widest"
            />
          </div>
          <div>
            <Label htmlFor="trackCaptchaAnswer" required>
              {captcha.a} + {captcha.b} = ?
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="trackCaptchaAnswer"
                inputMode="numeric"
                className="max-w-35"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
              />
              <button
                type="button"
                onClick={refreshCaptcha}
                disabled={refreshingCaptcha}
                className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                aria-label="नयाँ प्रश्न ल्याउनुहोस्"
                title="नयाँ प्रश्न ल्याउनुहोस्"
              >
                <RefreshCw className={refreshingCaptcha ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={loading} className="rounded-full sm:w-auto">
            <Search className="h-4 w-4" />
            हेर्नुहोस्
          </Button>
        </div>
      </form>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-500">ट्र्याकिङ कोड</p>
              <p className="text-lg font-semibold tracking-widest text-gray-900">{result.trackingCode}</p>
            </div>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium",
                COMPLAINT_STATUS_BADGE_CLASSES[result.status]
              )}
            >
              {COMPLAINT_STATUS_LABELS_NE[result.status]}
            </span>
          </div>

          <div>
            <p className="text-xs text-gray-500">विवरण</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{result.description}</p>
          </div>

          <div className="flex gap-6 text-xs text-gray-500">
            <span>दर्ता मिति: {formatDate(result.createdAt)}</span>
            <span>अद्यावधिक मिति: {formatDate(result.updatedAt)}</span>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-gray-900">अपडेट टिप्पणीहरू</p>
            {result.notes.length === 0 ? (
              <p className="text-sm text-gray-500">अहिलेसम्म कुनै अपडेट टिप्पणी छैन।</p>
            ) : (
              <ul className="space-y-3">
                {result.notes.map((note) => (
                  <li key={note.id} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">{formatDate(note.createdAt)}</p>
                    <p className="mt-1 text-sm text-gray-700">{note.note}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
