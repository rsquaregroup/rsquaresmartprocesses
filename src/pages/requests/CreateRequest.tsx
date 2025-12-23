import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function CreateRequest() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [typeId, setTypeId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const { data: requestTypes, isLoading } = useQuery({
    queryKey: ["request-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("request_types")
        .select("id, name, team_key")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!typeId) {
      toast.error("Please select a request type");
      return;
    }

    const selectedType = requestTypes?.find((type: any) => type.id === typeId);

    setSaving(true);
    const { error } = await supabase
      .from("requests")
      .insert({
        title,
        description: details,
        requester_id: profile.id,
        request_type_id: typeId,
        team_key: selectedType?.team_key ?? null,
        status: "submitted",
      });
    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Request submitted");
    navigate("/requests");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Request</h1>
        <p className="text-muted-foreground">Choose a request type and provide the details.</p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Request Type</Label>
              <Select value={typeId} onValueChange={setTypeId} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {requestTypes?.map((type: any) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short summary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide the context and any relevant information"
                rows={6}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Submitting..." : "Submit Request"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate("/requests")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
