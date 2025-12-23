import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const STATUS_OPTIONS = ["submitted", "in_review", "approved", "rejected", "cancelled"] as const;

export default function RequestDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const role = profile?.role ?? "requester";
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: request, isLoading, refetch } = useQuery({
    queryKey: ["request", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("requests")
        .select(
          "id, title, description, status, created_at, team_key, request_types(name), profiles(full_name)"
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: teams } = useQuery({
    queryKey: ["request-teams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("request_teams").select("key, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["request-comments", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("request_comments")
        .select("id, body, created_at, profiles(full_name)")
        .eq("request_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const canManage = role === "admin" || role === "backoffice";
  const canCancel = role === "requester" && request?.status === "submitted";

  const teamLabel = useMemo(() => {
    const team = teams?.find((item: any) => item.key === request?.team_key);
    return team?.name ?? request?.team_key ?? "-";
  }, [teams, request]);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    setSaving(true);
    const { error } = await supabase
      .from("requests")
      .update({ status })
      .eq("id", id);
    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Status updated");
    refetch();
  };

  const handleTeamChange = async (teamKey: string) => {
    if (!id) return;
    setSaving(true);
    const { error } = await supabase
      .from("requests")
      .update({ team_key: teamKey })
      .eq("id", id);
    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Request reassigned");
    refetch();
  };

  const handleComment = async () => {
    if (!id || !comment.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("request_comments")
      .insert({ request_id: id, body: comment.trim(), author_id: profile?.id });
    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setComment("");
    toast.success("Comment added");
    refetchComments();
  };

  const handleCancel = async () => {
    if (!id) return;
    setSaving(true);
    const { error } = await supabase.from("requests").update({ status: "cancelled" }).eq("id", id);
    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Request cancelled");
    refetch();
  };

  if (isLoading || !request) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{request.title}</h1>
          <p className="text-muted-foreground">{request.request_types?.name ?? "Request"}</p>
        </div>
        <StatusBadge status={request.status} label={STATUS_LABELS[request.status] ?? request.status} />
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Requester</p>
              <p className="font-medium">{request.profiles?.full_name ?? "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Submitted</p>
              <p className="font-medium">{new Date(request.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Team</p>
              <p className="font-medium">{teamLabel}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{STATUS_LABELS[request.status] ?? request.status}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="mt-2 whitespace-pre-wrap">{request.description || "No description provided."}</p>
          </div>
          {canCancel && (
            <Button variant="destructive" onClick={handleCancel} disabled={saving}>
              Cancel Request
            </Button>
          )}
        </CardContent>
      </Card>

      {canManage && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Backoffice Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={request.status} onValueChange={handleStatusChange} disabled={saving}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status] ?? status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assign Team</Label>
              <Select value={request.team_key ?? ""} onValueChange={handleTeamChange} disabled={saving}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams?.map((team: any) => (
                    <SelectItem key={team.key} value={team.key}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {comments?.length ? (
              comments.map((item: any) => (
                <div key={item.id} className="border-b pb-3 last:border-0">
                  <p className="text-sm font-medium">{item.profiles?.full_name ?? "User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm">{item.body}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Add a comment</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
            <Button onClick={handleComment} disabled={saving || !comment.trim()}>
              Add Comment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
