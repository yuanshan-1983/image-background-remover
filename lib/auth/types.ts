export type DbUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  email_verified: string | null;
  created_at: string;
  updated_at: string;
};

export type DbAccount = {
  id: string;
  user_id: string;
  type: string;
  provider: string;
  provider_account_id: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
  created_at: string;
  updated_at: string;
};

export type DbSession = {
  id: string;
  session_token: string;
  user_id: string;
  expires: string;
  created_at: string;
  updated_at: string;
};
