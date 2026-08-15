export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      book_insights: {
        Row: {
          body: string | null
          book_id: string
          created_at: string
          id: number
          insight_order: number
          title: string | null
          updated_at: string
          wolof_wisdom: string | null
        }
        Insert: {
          body?: string | null
          book_id: string
          created_at?: string
          id?: number
          insight_order: number
          title?: string | null
          updated_at?: string
          wolof_wisdom?: string | null
        }
        Update: {
          body?: string | null
          book_id?: string
          created_at?: string
          id?: number
          insight_order?: number
          title?: string | null
          updated_at?: string
          wolof_wisdom?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_insights_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_translations: {
        Row: {
          book_id: string
          created_at: string
          id: string
          lang: string
          payload: Json
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          lang: string
          payload: Json
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          lang?: string
          payload?: Json
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string | null
          category: string | null
          color_from: string | null
          color_to: string | null
          created_at: string
          emoji: string | null
          id: string
          is_free: boolean
          read_minutes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          color_from?: string | null
          color_to?: string | null
          created_at?: string
          emoji?: string | null
          id: string
          is_free?: boolean
          read_minutes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          color_from?: string | null
          color_to?: string | null
          created_at?: string
          emoji?: string | null
          id?: string
          is_free?: boolean
          read_minutes?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      manual_payments: {
        Row: {
          amount: number
          country: string
          created_at: string
          currency: string
          id: string
          method: string
          plan: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          screenshot_path: string | null
          sender_name: string | null
          sender_phone: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          country: string
          created_at?: string
          currency: string
          id?: string
          method?: string
          plan: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_path?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          country?: string
          created_at?: string
          currency?: string
          id?: string
          method?: string
          plan?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_path?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string
          badge: string
          created_at: string
          display_name: string | null
          goal_minutes: number
          grace_ends_at: string | null
          id: string
          language: string
          streak: number
          stripe_customer_id: string | null
          subscription_end_date: string | null
          subscription_plan: string | null
          subscription_start_date: string | null
          subscription_status: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          avatar?: string
          badge?: string
          created_at?: string
          display_name?: string | null
          goal_minutes?: number
          grace_ends_at?: string | null
          id: string
          language?: string
          streak?: number
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_plan?: string | null
          subscription_start_date?: string | null
          subscription_status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar?: string
          badge?: string
          created_at?: string
          display_name?: string | null
          goal_minutes?: number
          grace_ends_at?: string | null
          id?: string
          language?: string
          streak?: number
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_plan?: string | null
          subscription_start_date?: string | null
          subscription_status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      proverbs: {
        Row: {
          category: string | null
          created_at: string
          en_translation: string | null
          es_translation: string | null
          explanation: string | null
          flag: string | null
          fr_translation: string | null
          id: string
          it_translation: string | null
          origin: string | null
          translation: string | null
          updated_at: string
          wolof: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          en_translation?: string | null
          es_translation?: string | null
          explanation?: string | null
          flag?: string | null
          fr_translation?: string | null
          id: string
          it_translation?: string | null
          origin?: string | null
          translation?: string | null
          updated_at?: string
          wolof?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          en_translation?: string | null
          es_translation?: string | null
          explanation?: string | null
          flag?: string | null
          fr_translation?: string | null
          id?: string
          it_translation?: string | null
          origin?: string | null
          translation?: string | null
          updated_at?: string
          wolof?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          author: string | null
          created_at: string
          flag: string | null
          id: string
          is_featured: boolean
          region: string | null
          text: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          flag?: string | null
          id: string
          is_featured?: boolean
          region?: string | null
          text: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          created_at?: string
          flag?: string | null
          id?: string
          is_featured?: boolean
          region?: string | null
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
