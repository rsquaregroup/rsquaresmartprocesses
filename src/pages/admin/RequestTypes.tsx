import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function RequestTypes() {
  const [name, setName] = useState("");
  const [teamKey, setTeamKey] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: teams } = useQuery({
    queryKey: ["request-teams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("request_teams").select("key, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: requestTypes, refetch } = useQuery({
    queryKey: ["request-types-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("request_types")
        .select("id, name, team_key, active")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Type name is required");
      return;
    }
    if (!teamKey) {
      toast.error("Select a team");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("request_types")
      .insert({ name: name.trim(), team_key: teamKey, active: true });
    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Request type created");
    setName("");
    setTeamKey("");
    refetch();
  };

  const handleToggle = async (id: string, active: boolean) => {
    const { error } = await supabase.from("request_types").update({ active }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Request Types</h1>
        <p className="text-muted-foreground">Manage request types and routing teams.</p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Create Request Type</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type-name">Type Name</Label>
              <Input
                id="type-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Expense Reimbursement"
              />
            </div>
            <div className="space-y-2">
              <Label>Routing Team</Label>
              <Select value={teamKey} onValueChange={setTeamKey}>
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
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create Type"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Existing Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {requestTypes?.length ? (
            requestTypes.map((type: any) => (
              <div key={type.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{type.name}</p>
                  <p className="text-sm text-muted-foreground">Team: {type.team_key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <Switch checked={type.active} onCheckedChange={(value) => handleToggle(type.id, value)} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No request types yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
