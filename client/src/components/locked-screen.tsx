import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "wouter";

interface LockedScreenProps {
  title?: string;
  description?: string;
}

export function LockedScreen({ 
  title = "Login Required", 
  description = "Please log in to view this content" 
}: LockedScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold" data-testid="text-locked-title">{title}</h2>
          <p className="text-muted-foreground" data-testid="text-locked-description">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/login">
            <Button className="w-full" data-testid="button-login-locked">
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="w-full" data-testid="button-register-locked">
              Create Account
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
