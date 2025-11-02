import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Music, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const packages = [
  {
    id: 1,
    name: "1 Month",
    duration: 1,
    price: 60000,
    features: ["Upload unlimited songs", "Create albums", "Analytics dashboard", "Artist verification badge"],
  },
  {
    id: 2,
    name: "3 Months",
    duration: 3,
    price: 180000,
    originalPrice: 180000,
    discount: "Save 0%",
    features: [
      "Upload unlimited songs",
      "Create albums",
      "Analytics dashboard",
      "Artist verification badge",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: 3,
    name: "6 Months",
    duration: 6,
    price: 360000,
    originalPrice: 360000,
    discount: "Best Value",
    features: [
      "Upload unlimited songs",
      "Create albums",
      "Analytics dashboard",
      "Artist verification badge",
      "Priority support",
      "Featured artist placement",
    ],
  },
];

export default function RegisterArtistPage() {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    const pkg = packages.find((p) => p.id === selectedPackage);
    console.log("Artist registration submitted:", pkg);
    navigate("/profile2");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Music className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Become an Artist</h1>
          <p className="text-gray-400 text-lg">
            Choose your subscription plan and start sharing your music
          </p>
        </div>

        {/* Pricing Cards */}
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`relative bg-white/5 rounded-lg p-6 cursor-pointer transition border-2 ${
                  selectedPackage === pkg.id
                    ? "border-primary bg-primary/5"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{pkg.price.toLocaleString()}đ</span>
                    <span className="text-gray-400 text-sm ml-2">
                      / {pkg.duration} month{pkg.duration > 1 ? "s" : ""}
                    </span>
                  </div>
                  {pkg.discount && (
                    <p className="text-primary text-sm font-semibold">{pkg.discount}</p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-center">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPackage === pkg.id
                        ? "border-primary bg-primary"
                        : "border-white/30"
                    }`}
                  >
                    {selectedPackage === pkg.id && (
                      <div className="w-2 h-2 rounded-full bg-black" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/5 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-2">What you'll get:</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Unlimited music uploads and album creation</li>
              <li>• Artist verification badge on your profile</li>
              <li>• Access to detailed analytics and insights</li>
              <li>• Connect with fans and grow your audience</li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-black text-lg py-6"
          >
            Subscribe & Become an Artist
          </Button>

          <p className="text-center text-sm text-gray-400 mt-4">
            By subscribing, you agree to our Terms of Service and Artist Agreement
          </p>
        </form>
      </div>
    </div>
  );
}
