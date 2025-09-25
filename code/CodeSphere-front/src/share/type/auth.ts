export interface AuthLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: number;
  login_id: string;
  email: string;
}

export interface UserInfoProps {
  user_id: 0;
  login_id: '';
  email: '';
}
