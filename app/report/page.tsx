'use client';

import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import gsap from 'gsap';
import {
  MapPin,
  Upload,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Camera,
  Trash2,
  Award,
} from 'lucide-react';

const wasteTypes = [
  { id: 'plastic', label: 'Plastic', icon: '♻️', color: 'from-blue-500 to-blue-600' },
  { id: 'organic', label: 'Organic', icon: '🌿', color: 'from-green-500 to-green-600' },
  { id: 'hazardous', label: 'Hazardous', icon: '⚠️', color: 'from-red-500 to-red-600' },
  { id: 'ewaste', label: 'E-Waste', icon: '💻', color: 'from-purple-500 to-purple-600' },
  { id: 'construction', label: 'Construction', icon: '🏗️', color: 'from-yellow-500 to-yellow-600' },
];

const severityLevels = [
  { id: 'low', label: 'Low', points: 50, desc: 'Minor litter' },
  { id: 'medium', label: 'Medium', points: 100, desc: 'Significant area' },
  { id: 'high', label: 'High', points: 150, desc: 'Urgent cleanup' },
];

export default function ReportWastePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    latitude: null as number | null,
    longitude: null as number | null,
    wasteType: '',
    severity: '',
    description: '',
    image: null as string | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      });
    }
  }, []);

  useEffect(() => {
    // Animate step transition
    if (stepContainerRef.current) {
      gsap.fromTo(
        stepContainerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [step]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-1',
          title: `${formData.wasteType} Waste Report`,
          description: formData.description,
          ...formData,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        gsap.to(stepContainerRef.current, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            setTimeout(() => setStep(1), 2000);
          },
        });
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePoints = () => {
    const severity = severityLevels.find((s) => s.id === formData.severity);
    const wasteBonus = { plastic: 20, organic: 15, hazardous: 80, ewaste: 100, construction: 30 };
    return (severity?.points || 0) + (wasteBonus[formData.wasteType as keyof typeof wasteBonus] || 0);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.latitude !== null && formData.longitude !== null;
      case 2:
        return formData.wasteType && formData.severity;
      case 3:
        return imagePreview !== null;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (submitted) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-md">
            <div className="mb-6 flex justify-center">
              <div className="p-6 rounded-full bg-primary/10 animate-pulse">
                <CheckCircle className="w-16 h-16 text-primary" />
              </div>
            </div>
            <h1 className="font-heading text-3xl font-bold mb-4">Report Submitted!</h1>
            <p className="text-foreground/70 mb-4">
              Thank you for helping keep our cities clean. You earned{' '}
              <span className="font-bold text-primary">{calculatePoints()} points</span> and unlocked a new badge.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ latitude: null, longitude: null, wasteType: '', severity: '', description: '', image: null });
                setImagePreview(null);
                setStep(1);
              }}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
            >
              Report Another
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-background via-background to-accent/5">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="text-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all ${
                      s <= step
                        ? 'bg-primary text-white'
                        : 'bg-border text-foreground/50'
                    }`}
                  >
                    {s}
                  </div>
                  <p className="text-xs text-foreground/70">
                    {['Location', 'Type', 'Photo', 'Review'][s - 1]}
                  </p>
                </div>
              ))}
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div ref={stepContainerRef} className="bg-card rounded-2xl border border-border p-8 shadow-lg">
            {/* Step 1: Location */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-2xl font-bold mb-2">Where is the waste?</h2>
                  <p className="text-foreground/70">
                    Help us locate and track waste by pinning your location
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">GPS Location</p>
                      {formData.latitude && formData.longitude ? (
                        <p className="text-sm text-foreground/70">
                          📍 {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                        </p>
                      ) : (
                        <p className="text-sm text-foreground/70">Getting your location...</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm text-foreground/70">
                    Your location is used to map waste reports and help workers prioritize cleanup efforts.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Waste Type & Severity */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-2xl font-bold mb-2">What type of waste?</h2>
                  <p className="text-foreground/70">Select the waste category and severity level</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3">Waste Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {wasteTypes.map(({ id, label, icon }) => (
                      <button
                        key={id}
                        onClick={() => setFormData((prev) => ({ ...prev, wasteType: id }))}
                        className={`p-4 rounded-lg border-2 transition-all text-center ${
                          formData.wasteType === id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-2xl mb-2">{icon}</div>
                        <p className="text-sm font-medium">{label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3">Severity Level</label>
                  <div className="space-y-2">
                    {severityLevels.map(({ id, label, points, desc }) => (
                      <button
                        key={id}
                        onClick={() => setFormData((prev) => ({ ...prev, severity: id }))}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          formData.severity === id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{label}</p>
                            <p className="text-sm text-foreground/70">{desc}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award size={18} className="text-accent" />
                            <span className="font-bold text-primary">+{points}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Photo */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-2xl font-bold mb-2">Show us the waste</h2>
                  <p className="text-foreground/70">
                    Upload a clear photo for AI analysis and verification
                  </p>
                </div>

                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Waste preview"
                      className="w-full h-64 object-cover rounded-lg border border-border"
                    />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setFormData((prev) => ({ ...prev, image: null }));
                      }}
                      className="absolute top-2 right-2 p-2 bg-destructive text-white rounded-full hover:bg-destructive/90"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="p-4 rounded-full bg-primary/10">
                        <Camera size={32} className="text-primary" />
                      </div>
                    </div>
                    <p className="font-semibold mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm text-foreground/70">PNG, JPG up to 10MB</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20 flex gap-3">
                  <AlertCircle size={20} className="text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/70">
                    Clear photos help our AI accurately classify waste. Multiple angles are welcome!
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-2xl font-bold mb-2">Review your report</h2>
                  <p className="text-foreground/70">Everything looks good? Submit to earn rewards</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-foreground/60 uppercase font-semibold mb-1">
                      Location
                    </p>
                    <p className="font-semibold">
                      {formData.latitude?.toFixed(4)}, {formData.longitude?.toFixed(4)}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-foreground/60 uppercase font-semibold mb-1">
                      Waste Type
                    </p>
                    <p className="font-semibold capitalize">
                      {wasteTypes.find((t) => t.id === formData.wasteType)?.label}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-xs text-foreground/60 uppercase font-semibold mb-1">
                      Severity
                    </p>
                    <p className="font-semibold capitalize">
                      {severityLevels.find((s) => s.id === formData.severity)?.label}
                    </p>
                  </div>

                  {imagePreview && (
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <p className="text-xs text-foreground/60 uppercase font-semibold mb-3">
                        Photo
                      </p>
                      <img
                        src={imagePreview}
                        alt="Review"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-foreground/70 mb-2">You will earn:</p>
                    <p className="text-3xl font-bold text-primary">{calculatePoints()} Points</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-border">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="flex-1 px-6 py-3 border border-border rounded-lg hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ChevronLeft size={20} /> Back
              </button>
              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!isStepValid()}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Next <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
