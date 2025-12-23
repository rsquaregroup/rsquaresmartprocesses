import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface GlassCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
  icon?: ReactNode;
}

export function GlassCard({ title, description, children, className, headerActions, icon }: GlassCardProps) {
  return (
    <Card className={cn("glass-card transition-smooth hover:shadow-lg", className)}>
      {(title || description || headerActions || icon) && (
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="flex items-start gap-3">
            {icon && <div className="mt-0.5">{icon}</div>}
            <div className="space-y-1">
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
          {headerActions && <div className="flex gap-2">{headerActions}</div>}
        </CardHeader>
      )}
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}
