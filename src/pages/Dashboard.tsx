import { useMemo } from "react";
import { useAuth } from "@/contexts/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/shared/StatusBadge";

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export default function Dashboard() {
  const { profile } = useAuth();
  const role = profile?.role ?? "requester";

  const baseQuery = role === "requester"
    ? supabase.from("requests").select("*").eq("requester_id", profile?.id ?? "")
    : supabase.from("requests").select("*");

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["request-stats", role, profile?.id],
    queryFn: async () => {
      const { data, error } = await baseQuery;
      if (error) throw error;
      const totals = {
        total: data.length,
        in_review: data.filter((item) => item.status === "in_review").length,
        approved: data.filter((item) => item.status === "approved").length,
        rejected: data.filter((item) => item.status === "rejected").length,
      };
      return totals;
    },
  });

  const { data: recentRequests, isLoading: loadingRecent } = useQuery({
    queryKey: ["recent-requests", role, profile?.id],
    queryFn: async () => {
      const query = role === "requester"
        ? supabase
            .from("requests")
            .select("id, title, status, created_at, request_types(name)")
            .eq("requester_id", profile?.id ?? "")
        : supabase
            .from("requests")
            .select("id, title, status, created_at, request_types(name), profiles(full_name)");

      const { data, error } = await query.order("created_at", { ascending: false }).limit(6);
      if (error) throw error;
      return data;
    },
  });

  const cards = useMemo(
    () => [
      {
        title: "Total Requests",
        value: stats?.total ?? 0,
        icon: FileText,
      },
      {
        title: "In Review",
        value: stats?.in_review ?? 0,
        icon: Clock,
      },
      {
        title: "Approved",
        value: stats?.approved ?? 0,
        icon: CheckCircle2,
      },
      {
        title: "Rejected",
        value: stats?.rejected ?? 0,
        icon: XCircle,
      },
    ],
    [stats]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {role === "requester" ? "Track your requests at a glance." : "Manage incoming requests across teams."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loadingStats ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{card.value}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{role === "requester" ? "Your Recent Requests" : "Latest Requests"}</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : recentRequests && recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.map((request: any) => (
                <div key={request.id} className="flex flex-col gap-2 border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <Link to={`/requests/${request.id}`} className="font-medium hover:underline">
                      {request.title}
                    </Link>
                    <StatusBadge status={request.status} label={STATUS_LABELS[request.status] ?? request.status} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {request.request_types?.name ?? "Request"}
                    {request.profiles?.full_name ? ` • ${request.profiles.full_name}` : ""}
                    {" • "}{new Date(request.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No requests yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
