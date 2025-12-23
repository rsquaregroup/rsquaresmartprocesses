import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const ROLE_OPTIONS = ["requester", "backoffice", "admin"];

export default function Users() {
  const { data: teams } = useQuery({
    queryKey: ["request-teams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("request_teams").select("key, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles, refetch } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role, team_key");
      if (error) throw error;
      return data;
    },
  });

  const roleMap = useMemo(() => {
    const map = new Map<string, { role: string; team_key: string | null }>();
    roles?.forEach((item: any) => map.set(item.user_id, item));
    return map;
  }, [roles]);

  const handleRoleChange = async (userId: string, role: string) => {
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role }, { onConflict: "user_id" });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Role updated");
    refetch();
  };

  const handleTeamChange = async (userId: string, teamKey: string) => {
    const existing = roleMap.get(userId)?.role ?? "requester";
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: existing, team_key: teamKey }, { onConflict: "user_id" });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Team updated");
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Assign roles and teams.</p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Team</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles?.length ? (
                profiles.map((profile: any) => {
                  const role = roleMap.get(profile.id)?.role ?? "requester";
                  const teamKey = roleMap.get(profile.id)?.team_key ?? "";
                  return (
                    <TableRow key={profile.id}>
                      <TableCell>{profile.full_name}</TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        <Select value={role} onValueChange={(value) => handleRoleChange(profile.id, value)}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={teamKey ?? ""} onValueChange={(value) => handleTeamChange(profile.id, value)}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="No team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams?.map((team: any) => (
                              <SelectItem key={team.key} value={team.key}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
