import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentFailedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get("orderCode");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <XCircle className="h-24 w-24 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Payment Failed</h1>
          <p className="text-muted-foreground">
            Unfortunately, your payment could not be processed. Please try again
            or contact support.
          </p>
        </div>

        {orderCode && (
          <p className="text-xs text-muted-foreground">
            Order code: <span className="font-mono">{orderCode}</span>
          </p>
        )}

        <div className="space-y-3 pt-4">
          <Button
            onClick={() => navigate(-1)}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Try Again
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
