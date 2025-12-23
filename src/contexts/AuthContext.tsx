import { useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AuthContext, Profile, UserRole } from "@/contexts/auth-context";

const ROLE_PRIORITY: UserRole[] = ["admin", "backoffice", "requester"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user);
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userObj: User) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", userObj.id)
        .single();

      if (profileError) {
        console.warn("Error fetching profile:", profileError);
      }

      const { data: rolesData, error: roleError } = await supabase
        .from("user_roles")
        .select("role, team_key")
        .eq("user_id", userObj.id);

      if (roleError) {
        console.warn("Error fetching roles:", roleError);
      }

      const roles = rolesData?.map((r) => r.role as UserRole) ?? [];
      let selectedRole: UserRole = "requester";

      for (const role of ROLE_PRIORITY) {
        if (roles.includes(role)) {
          selectedRole = role;
          break;
        }
      }

      const teamKey = rolesData?.find((r) => r.role === selectedRole)?.team_key ?? null;

      setProfile({
        id: profileData?.id ?? userObj.id,
        full_name: profileData?.full_name ?? userObj.user_metadata?.full_name ?? userObj.email ?? "User",
        email: profileData?.email ?? userObj.email ?? "",
        role: selectedRole,
        team_key: teamKey,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) return { error: authError };
    if (!authData.user) return { error: new Error("User creation failed") };

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: authData.user.id, full_name: fullName, email });

    if (profileError) return { error: profileError };

    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: authData.user.id, role: "requester" });

    if (roleError) return { error: roleError };

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
