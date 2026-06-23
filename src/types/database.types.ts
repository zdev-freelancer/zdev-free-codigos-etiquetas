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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      inventory: {
        Row: {
          id: string
          product_id: string
          stock_level: number
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          stock_level?: number
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          stock_level?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          price_at_purchase: number
          product_id: string
          quantity: number
        }
        Insert: {
          id?: string
          order_id: string
          price_at_purchase: number
          product_id: string
          quantity: number
        }
        Update: {
          id?: string
          order_id?: string
          price_at_purchase?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          email: string | null
          full_name: string | null
          id: string
          payment_provider: string | null
          payment_reference: string | null
          phone: string | null
          shipping_address: Json | null
          shipping_district: string | null
          status: Database["public"]["Enums"]["order_status"]
          tenant_id: string
          total_amount: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          email?: string | null
          full_name?: string | null
          id?: string
          payment_provider?: string | null
          payment_reference?: string | null
          phone?: string | null
          shipping_address?: Json | null
          shipping_district?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          tenant_id: string
          total_amount: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          email?: string | null
          full_name?: string | null
          id?: string
          payment_provider?: string | null
          payment_reference?: string | null
          phone?: string | null
          shipping_address?: Json | null
          shipping_district?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          tenant_id?: string
          total_amount?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          display_order: number
          id: string
          image_url: string
          product_id: string
        }
        Insert: {
          alt_text?: string | null
          display_order?: number
          id?: string
          image_url: string
          product_id: string
        }
        Update: {
          alt_text?: string | null
          display_order?: number
          id?: string
          image_url?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          collection: string | null
          compatibility: string[]
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          description: string | null
          downloads: Json
          id: string
          is_featured: boolean
          material: string | null
          name: string
          price: number
          pricing_mode: string
          show_description: boolean
          show_downloads: boolean
          show_specs: boolean
          slug: string
          status: string
          tenant_id: string
        }
        Insert: {
          collection?: string | null
          compatibility?: string[]
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          description?: string | null
          downloads?: Json
          id?: string
          is_featured?: boolean
          material?: string | null
          name: string
          price: number
          pricing_mode?: string
          show_description?: boolean
          show_downloads?: boolean
          show_specs?: boolean
          slug: string
          status?: string
          tenant_id: string
        }
        Update: {
          collection?: string | null
          compatibility?: string[]
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          description?: string | null
          downloads?: Json
          id?: string
          is_featured?: boolean
          material?: string | null
          name?: string
          price?: number
          pricing_mode?: string
          show_description?: boolean
          show_downloads?: boolean
          show_specs?: boolean
          slug?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tenant_members: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["tenant_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: Database["public"]["Enums"]["tenant_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["tenant_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_payment_config: {
        Row: {
          mp_access_token: string | null
          mp_public_key: string | null
          mp_webhook_secret: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          mp_access_token?: string | null
          mp_public_key?: string | null
          mp_webhook_secret?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          mp_access_token?: string | null
          mp_public_key?: string | null
          mp_webhook_secret?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_payment_config_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          custom_domain: string | null
          default_currency: Database["public"]["Enums"]["currency_code"]
          id: string
          logo_url: string | null
          name: string
          slug: string
          status: string
          theme: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          default_currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          status?: string
          theme?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          default_currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          status?: string
          theme?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_tenant_admin: { Args: { p_tenant: string }; Returns: boolean }
      mark_order_failed: { Args: { p_order_id: string }; Returns: undefined }
      mark_order_paid: {
        Args: { p_order_id: string; p_payment_reference?: string }
        Returns: Database["public"]["Enums"]["order_status"]
      }
    }
    Enums: {
      currency_code: "PEN" | "USD"
      order_status: "pending" | "paid" | "shipped" | "delivered"
      tenant_role: "owner" | "admin"
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
      currency_code: ["PEN", "USD"],
      order_status: ["pending", "paid", "shipped", "delivered"],
      tenant_role: ["owner", "admin"],
    },
  },
} as const
