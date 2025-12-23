export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          user_id: string;
          role: "admin" | "backoffice" | "requester";
          team_key: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: "admin" | "backoffice" | "requester";
          team_key?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          role?: "admin" | "backoffice" | "requester";
          team_key?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      request_teams: {
        Row: {
          key: string;
          name: string;
          created_at: string;
        };
        Insert: {
          key: string;
          name: string;
          created_at?: string;
        };
        Update: {
          key?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      request_types: {
        Row: {
          id: string;
          name: string;
          team_key: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          team_key?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          team_key?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      requests: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          requester_id: string;
          request_type_id: string;
          team_key: string | null;
          status: "submitted" | "in_review" | "approved" | "rejected" | "cancelled";
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          requester_id: string;
          request_type_id: string;
          team_key?: string | null;
          status?: "submitted" | "in_review" | "approved" | "rejected" | "cancelled";
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          requester_id?: string;
          request_type_id?: string;
          team_key?: string | null;
          status?: "submitted" | "in_review" | "approved" | "rejected" | "cancelled";
          created_at?: string;
        };
        Relationships: [];
      };
      request_comments: {
        Row: {
          id: string;
          request_id: string;
          author_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          author_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          author_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
