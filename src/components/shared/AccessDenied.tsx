import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <ShieldX className="h-16 w-16 text-destructive/60" />
      <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
      <p className="text-muted-foreground text-center max-w-md">
        You don't have permission to access this page. If you believe this is an error,
        please contact your administrator.
      </p>
      <Button onClick={() => navigate('/dashboard')} variant="outline">
        Go to Dashboard
      </Button>
    </div>
  );
}
