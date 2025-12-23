import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export default function RequestsList() {
  const { profile } = useAuth();
  const role = profile?.role ?? "requester";

  const { data: requests, isLoading } = useQuery({
    queryKey: ["requests", role, profile?.id],
    queryFn: async () => {
      const query = role === "requester"
        ? supabase
            .from("requests")
            .select("id, title, status, created_at, request_types(name)")
            .eq("requester_id", profile?.id ?? "")
        : supabase
            .from("requests")
            .select("id, title, status, created_at, request_types(name), profiles(full_name)");

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const tableRows = useMemo(() => requests ?? [], [requests]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Requests</h1>
          <p className="text-muted-foreground">
            {role === "requester" ? "Track your submitted requests." : "Review and manage incoming requests."}
          </p>
        </div>
        {role === "requester" && (
          <Button asChild>
            <Link to="/requests/new">New Request</Link>
          </Button>
        )}
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  {role !== "requester" && <TableHead>Requester</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.length ? (
                  tableRows.map((request: any) => (
                    <TableRow key={request.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Link to={`/requests/${request.id}`} className="font-medium hover:underline">
                          {request.title}
                        </Link>
                      </TableCell>
                      <TableCell>{request.request_types?.name ?? "Request"}</TableCell>
                      {role !== "requester" && <TableCell>{request.profiles?.full_name ?? "-"}</TableCell>}
                      <TableCell>
                        <StatusBadge status={request.status} label={STATUS_LABELS[request.status] ?? request.status} />
                      </TableCell>
                      <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={role === "requester" ? 4 : 5} className="text-muted-foreground">
                      No requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
