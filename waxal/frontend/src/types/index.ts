export type Tone = 'witty' | 'professional' | 'poetic' | 'casual' | 'hype';
export type Platform = 'instagram' | 'twitter' | 'linkedin' | 'tiktok';
export type CaptionLanguage = 'wolof' | 'wolof_pure' | 'french';
export type UiLanguage = 'wo' | 'fr' | 'en';

export interface CaptionVariant {
  id: string;
  text: string;
  hashtags: string[];
  tone: Tone;
  confidence: number;
}

export interface CaptionResponse {
  captions: CaptionVariant[];
  image_description: string;
  generated_at: string;
  history_id: number;
  generations_left: number | null;
}

export interface HistoryItem {
  id: number;
  image_url: string;
  captions: CaptionVariant[];
  image_description: string;
  tone: Tone;
  platform: Platform;
  language: CaptionLanguage;
  is_favorite: boolean;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  display_name: string;
  plan: 'free' | 'pro';
  pro_expires_at: string | null;
  generations_used: number;
  generations_limit: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PlanInfo {
  name: string;
  monthly_generations: number;
  price_fcfa: number;
}

export interface PlansResponse {
  free: PlanInfo;
  pro: PlanInfo;
  payment_ready: boolean;
}

export interface UploadResponse {
  id: number;
  url: string;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}
