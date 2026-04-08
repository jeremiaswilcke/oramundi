export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          country_code: string | null;
          city: string | null;
          latitude: number | null;
          longitude: number | null;
          locale: string;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          country_code?: string | null;
          city?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          locale?: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          country_code?: string | null;
          city?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          locale?: string;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
      };
      prayer_sessions: {
        Row: {
          id: string;
          user_id: string;
          mystery_type: "joyful" | "luminous" | "sorrowful" | "glorious";
          mode: "quick" | "guided";
          latitude: number | null;
          longitude: number | null;
          started_at: string;
          ended_at: string | null;
          completed: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          mystery_type: "joyful" | "luminous" | "sorrowful" | "glorious";
          mode?: "quick" | "guided";
          latitude?: number | null;
          longitude?: number | null;
          started_at?: string;
          ended_at?: string | null;
          completed?: boolean;
        };
        Update: {
          mystery_type?: "joyful" | "luminous" | "sorrowful" | "glorious";
          mode?: "quick" | "guided";
          latitude?: number | null;
          longitude?: number | null;
          ended_at?: string | null;
          completed?: boolean;
        };
      };
      intentions: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          is_anonymous: boolean;
          is_answered: boolean;
          is_flagged: boolean;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          is_anonymous?: boolean;
          is_answered?: boolean;
          is_flagged?: boolean;
          is_hidden?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          is_anonymous?: boolean;
          is_answered?: boolean;
          is_flagged?: boolean;
          is_hidden?: boolean;
          updated_at?: string;
        };
      };
      intention_prayers: {
        Row: {
          id: string;
          intention_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          intention_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      intention_flags: {
        Row: {
          id: string;
          intention_id: string;
          user_id: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          intention_id: string;
          user_id: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
