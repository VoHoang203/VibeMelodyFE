import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("[v0] Password reset request for:", email);
    toast.success("Reset link sent!");
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Vibe Melody</h1>
          <p className="text-gray-400">Reset your password</p>
        </div>

        <div className="bg-card rounded-lg p-8 shadow-xl border border-white/10">
          <Link to="/login" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6 transition">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
          </Link>

          <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
          <p className="text-gray-400 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary transition"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-black font-semibold py-3">
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Check your email</h3>
              <p className="text-gray-400 mb-6">
                We've sent a password reset link to <span className="text-white font-semibold">{email}</span>
              </p>
              <Link to="/login">
                <Button className="bg-primary hover:bg-primary/90 text-black">Back to Login</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
