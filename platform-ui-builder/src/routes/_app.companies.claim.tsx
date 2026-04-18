import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Upload, ShieldCheck, ArrowRight, Loader2, Check } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

export const Route = createFileRoute("/_app/companies/claim")({
  component: ClaimCompany,
});

function ClaimCompany() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    gst_no: "",
    city: "",
    domain: "",
    work_email: "",
  });
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [otp, setOtp] = useState("");

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  // Step 1 → Step 2: Verify GST
  const handleStep1 = async () => {
    if (!form.company_name || !form.gst_no || !form.city) {
      toast.error("Fill in all required fields");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetchApi("/auth/verify-gst/", {
        method: "POST",
        body: JSON.stringify({
          gst_no: form.gst_no,
          company_name: form.company_name,
          city: form.city,
        }),
      });
      if (res.ok) {
        toast.success("GST verified!");
        setStep(2);
      } else {
        const e = await res.json().catch(() => ({}));
        toast.error(e.detail || "GST verification failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 → Step 3: OTP
  const handleSendOtp = async () => {
    if (!form.work_email) {
      toast.error("Enter your work phone (+91...)");
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.work_email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("OTP sent securely via SMS!");
        setStep(3);
      } else {
        toast.error(data.msg || "Failed to dispatch OTP");
      }
    } catch (e) {
      toast.error("Network error reaching OTP microservice.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.work_email, otp: otp }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Phone verified securely!");
        setStep(4);
      } else {
        toast.error(data.msg || "Invalid OTP code");
      }
    } catch (e) {
      toast.error("Network error reaching OTP microservice.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Submit Claim
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi("/companies/", {
        method: "POST",
        body: JSON.stringify({
          name: form.company_name,
          description: `Company in ${form.city}. Official Domain: ${form.domain}`,
        }),
      });
      if (!res.ok) {
        toast.error("Failed to register company claim.");
        return;
      }
      setStep(5);
    } catch (e) {
      toast.error("Network error during submission");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl p-4 lg:p-6">
      <PageHeader
        title="Claim a Company"
        description="Verify ownership to manage your company page on TrustNet."
      />

      {/* Progress Steps */}
      <div className="mt-6 flex items-center gap-1 text-xs text-muted-foreground mb-6">
        {["GST Verify", "Work Email", "OTP", "Documents"].map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold border ${step > i + 1 ? "bg-success text-success-foreground border-success/30" : step === i + 1 ? "bg-primary text-primary-foreground border-primary/30" : "border-border"}`}
            >
              {step > i + 1 ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className={step === i + 1 ? "text-foreground font-medium" : ""}>{label}</span>
            {i < 3 && <span className="mx-1 flex-1 border-t hidden sm:block" />}
          </div>
        ))}
      </div>

      {step === 5 ? (
        <div className="rounded-xl border border-success/30 bg-success/5 p-8 text-center">
          <Check className="h-10 w-10 text-success mx-auto mb-3" />
          <p className="text-lg font-semibold">Claim Submitted!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            A TrustNet admin will review your claim within 1–2 business days and email you.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
          {/* Step 1: GST */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <p className="font-semibold text-base">Business Verification</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  We verify your GST details against official government records.
                </p>
              </div>
              <div>
                <Label>Company Name *</Label>
                <Input
                  value={form.company_name}
                  onChange={f("company_name")}
                  className="mt-1.5"
                  placeholder="Exactly as registered"
                />
              </div>
              <div>
                <Label>City *</Label>
                <Input
                  value={form.city}
                  onChange={f("city")}
                  className="mt-1.5"
                  placeholder="HQ city"
                />
              </div>
              <div>
                <Label>GST Number *</Label>
                <Input
                  value={form.gst_no}
                  onChange={f("gst_no")}
                  className="mt-1.5 uppercase"
                  placeholder="e.g., 22AAAAA0000A1Z5"
                />
              </div>
              <Button className="w-full" onClick={handleStep1} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" /> Verify GST
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Work Email */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="font-semibold text-base">Phone Verification</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Confirm your association with {form.company_name} securely via Twilio SMS.
                </p>
              </div>
              <div>
                <Label>Work Phone (SMS) *</Label>
                <Input
                  type="tel"
                  value={form.work_email}
                  onChange={f("work_email")}
                  className="mt-1.5"
                  placeholder="+919876543210"
                />
              </div>
              <div>
                <Label>Company Domain</Label>
                <Input
                  value={form.domain}
                  onChange={f("domain")}
                  className="mt-1.5"
                  placeholder="acme.com"
                />
              </div>
              <Button className="w-full" onClick={handleSendOtp} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <>
                    Send OTP <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 3: OTP */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="font-semibold text-base">Enter OTP</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Check {form.work_email} for your 6-digit code.
                </p>
              </div>
              <div>
                <Label>6-Digit Code</Label>
                <Input
                  className="mt-1.5 text-center tracking-[0.5em] font-mono text-xl"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="• • • • • •"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={otp.length < 6 || isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Verify OTP"}
              </Button>
            </div>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <p className="font-semibold text-base">Upload Proof of Employment</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Upload a payslip, contract, or work email screenshot.
                </p>
              </div>
              <div
                className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileRef}
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDocPreview(file.name);
                    }
                  }}
                />
                {docPreview ? (
                  <p className="text-sm font-medium text-success">{docPreview} ✓</p>
                ) : (
                  <>
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm">Click to upload document</p>
                  </>
                )}
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Submit Claim"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
