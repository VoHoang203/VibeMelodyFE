import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "../store/useUserStore";
import { api } from "../lib/api";
import { toast } from "react-hot-toast";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout, initializeUser } = useUserStore();

  const [loading, setLoading] = useState(true);
  const orderCode = searchParams.get("orderCode");

  useEffect(() => {
    if (!orderCode) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/payos/status/${orderCode}`);
        if (cancelled) return;

        initializeUser?.();
       
        console.log("Payment status:", data);
      } catch (err) {
        console.error("Check payment status failed:", err);
        toast.error("Không kiểm tra được trạng thái thanh toán");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderCode, initializeUser]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-24 w-24 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground">
            Your payment has been processed successfully. Thank you for your
            purchase.
          </p>
        </div>

        {orderCode && (
          <p className="text-xs text-muted-foreground">
            Order code: <span className="font-mono">{orderCode}</span>
          </p>
        )}

        {loading && (
          <p className="text-xs text-muted-foreground">
            Verifying payment status...
          </p>
        )}

        <div className="space-y-3 pt-4">
          <Button
            onClick={() => navigate("/")}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Go to Home
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full bg-transparent"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
