import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { ShieldCheck, Check, Camera, Upload, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";

export const Route = createFileRoute("/signup")({
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    phone_no: "",
    ceo_name: "",
    company_type: "Technology",
    gst_no: "",
    city: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start Camera
  useEffect(() => {
    if (step === (form.role === "company_admin" ? 4 : 3)) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => toast.error("Camera access required for verification"));
    } else {
      // Stop camera if not on that step
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    }
  }, [step, form.role]);

  // Validate Step 1: Details
  const handleStep1 = async () => {
    const err: Record<string, string> = {};
    if (form.name.trim().length < 2)
      err.name = form.role === "company_admin" ? "Enter company name" : "Enter full name";
    if (!/.+@.+\..+/.test(form.email)) err.email = "Enter a valid email";
    if (form.password.length < 8) err.password = "At least 8 characters";
    if (form.phone_no.length < 10) err.phone_no = "Valid phone required";

    if (form.role === "company_admin") {
      if (!form.ceo_name.trim()) err.ceo_name = "CEO Name required";
      if (!form.gst_no.trim()) err.gst_no = "GST No required";
      if (!form.city.trim()) err.city = "City required";
    }

    setErrors(err);
    if (!Object.keys(err).length) {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:3000/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: form.phone_no }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("OTP sent securely via SMS!");
          setStep(2); // Move to OTP
        } else {
          toast.error(data.msg || "Failed to dispatch OTP");
        }
      } catch (e) {
        toast.error("Network error connecting to Twilio microservice.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Step 2: OTP
  const handleStep2 = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone_no, otp }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Phone verified securely!");
        setStep(form.role === "company_admin" ? 3 : 3); // Wait, if user -> 3 (Face), if company -> 3 (GST)
      } else {
        toast.error(data.msg || "Invalid OTP code");
      }
    } catch (e) {
      toast.error("Network error verifying OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: GST (Business Only)
  const handleStep3GST = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi("/auth/verify-gst/", {
        method: "POST",
        body: JSON.stringify({ gst_no: form.gst_no, company_name: form.name, city: form.city }),
      });
      if (res.ok) {
        toast.success("GST Verified Successfully");
        setStep(4); // Move to Face step
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.detail || "Invalid GST credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Final Step: Face Match & Submit
  const handleFaceSubmit = async () => {
    setIsLoading(true);
    try {
      // 1. Capture Passport Image Base64
      if (!fileInputRef.current?.files?.[0]) {
        throw new Error("Please upload your passport or ID photo for verification.");
      }
      const passportFile = fileInputRef.current.files[0];
      const passportB64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result?.toString() || "");
        reader.readAsDataURL(passportFile);
      });

      // 2. Capture Live Webcam Snapshot
      const video = videoRef.current;
      if (!video || !video.srcObject) {
        throw new Error("Live webcam feed is required to verify identity.");
      }
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const liveB64 = canvas.toDataURL("image/jpeg");

      // 3. Verify Face utilizing Biometric Vision AI
      const faceRes = await fetchApi("/auth/verify-face/", {
        method: "POST",
        body: JSON.stringify({ live_image: liveB64, passport_image: passportB64 }),
      });
      if (!faceRes.ok) {
        const d = await faceRes.json().catch(() => ({}));
        throw new Error(d.detail || "Face verification mismatch.");
      }

      // 2. All verifications passed -> CREATE ACCOUNT
      const resp = await fetchApi("/auth/signup/", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.email?.[0] || errorData.detail || "Signup failed");
      }

      // Auto login
      const loginResp = await fetchApi("/auth/login/", {
        method: "POST",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      if (loginResp.ok) {
        const data = await loginResp.json();
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
      }

      // Stop Camera
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }

      toast.success("Account created and fully verified!");
      navigate({ to: "/dashboard" });
    } catch (error: any) {
      toast.error(error.message || "Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r bg-soft-radial lg:block">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative flex h-full items-center justify-center p-10">
          <div className="max-w-md">
            <h2 className="text-3xl font-semibold tracking-tight">Verified Trust from Day One.</h2>
            <ul className="mt-6 space-y-4 text-sm">
              {[
                "Instant Identity Verification",
                "Advanced AI Live Camera Matching",
                form.role === "company_admin"
                  ? "Real-time GST Validations"
                  : "Phone OTP Verification",
                "Start networking immediately securely",
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-10 relative">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold">TrustNet Secured</span>
            </Link>
            <span className="text-xs bg-muted px-2 py-1 rounded-full font-medium">
              Step {step} of {form.role === "company_admin" ? 4 : 3}
            </span>
          </div>

          {/* STEP 1: Initial Details */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h1 className="text-2xl font-semibold tracking-tight">Account Details</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Select your account type and provide basic details.
              </p>

              <div className="mt-6 flex rounded-lg border bg-muted/50 p-1 mb-4">
                <button
                  type="button"
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${form.role === "user" ? "bg-background shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
                  onClick={() => setForm({ ...form, role: "user" })}
                >
                  Professional
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${form.role === "company_admin" ? "bg-background shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
                  onClick={() => setForm({ ...form, role: "company_admin" })}
                >
                  Business
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    {form.role === "company_admin" ? "Company name" : "Full name"}
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1.5"
                  />
                  {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                </div>

                {form.role === "company_admin" && (
                  <>
                    <div>
                      <Label htmlFor="ceo">CEO Name</Label>
                      <Input
                        id="ceo"
                        value={form.ceo_name}
                        onChange={(e) => setForm((f) => ({ ...f, ceo_name: e.target.value }))}
                        className="mt-1.5"
                      />
                      {errors.ceo_name && (
                        <p className="mt-1 text-xs text-destructive">{errors.ceo_name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="city">City Headquarters</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                        className="mt-1.5"
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs text-destructive">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="gst">Company GST No</Label>
                      <Input
                        id="gst"
                        placeholder="e.g. 22AAAAA0000A1Z5PASS"
                        value={form.gst_no}
                        onChange={(e) => setForm((f) => ({ ...f, gst_no: e.target.value }))}
                        className="mt-1.5 uppercase"
                      />
                      {errors.gst_no && (
                        <p className="mt-1 text-xs text-destructive">{errors.gst_no}</p>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="phone">Phone No</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone_no}
                    onChange={(e) => setForm((f) => ({ ...f, phone_no: e.target.value }))}
                    className="mt-1.5"
                  />
                  {errors.phone_no && (
                    <p className="mt-1 text-xs text-destructive">{errors.phone_no}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="mt-1.5"
                  />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="mt-1.5"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-destructive">{errors.password}</p>
                  )}
                </div>

                <Button className="w-full mt-2" onClick={handleStep1} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" /> Sending OTP...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" /> Continue Verification
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Phone Verification */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 relative space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Verify Phone</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  We sent a 6-digit OTP to {form.phone_no}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>One-Time Password</Label>
                  <Input
                    className="mt-1.5 text-center tracking-[0.5em] font-mono text-xl"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="• • • • • •"
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="w-full" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    className="w-full"
                    onClick={handleStep2}
                    disabled={otp.length < 6 || isLoading}
                  >
                    {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Verify Phone"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: GST Verification (Business Only) */}
          {step === 3 && form.role === "company_admin" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 relative space-y-6">
              <div className="bg-primary/5 p-4 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <ShieldCheck className="text-primary h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Business Verification</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  We are verifying <strong>{form.gst_no}</strong> against official government
                  databases.
                </p>
              </div>
              <div className="flex gap-2 mt-8">
                <Button variant="outline" className="w-full" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button className="w-full" onClick={handleStep3GST} disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Validate GST"}
                </Button>
              </div>
            </div>
          )}

          {/* FINAL STEP: Face Verification */}
          {((step === 3 && form.role === "user") ||
            (step === 4 && form.role === "company_admin")) && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 relative space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Face Match AI</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Look directly at the camera. We match this with your passport photo.
                </p>
              </div>

              <div className="space-y-4">
                {/* Live Feed */}
                <div className="relative aspect-auto bg-black rounded-xl overflow-hidden border border-muted flex items-center justify-center min-h-[220px]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-xl pointer-events-none" />
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded-md flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live Camera
                    Active
                  </div>
                </div>

                {/* Upload Passport Box */}
                <div
                  className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors relative overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPassportPreview(URL.createObjectURL(file));
                    }}
                  />
                  {passportPreview ? (
                    <img
                      src={passportPreview}
                      alt="Passport"
                      className="mx-auto h-24 object-contain rounded-md"
                    />
                  ) : (
                    <>
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">Upload Passport Photo</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="w-full" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                  <Button
                    className="w-full bg-success text-success-foreground hover:bg-success/90"
                    onClick={handleFaceSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" /> Analyzing...
                      </>
                    ) : (
                      "Match & Finish Signup"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
