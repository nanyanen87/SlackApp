export interface UserToken {
  accessToken: string;
  refreshToken: string;
  scope: string;
  tokenType: string;
  expiryDate: number;
}

// {
//   "access_token": "ya29.a0AcM612xS7AMjVnuKYnu0M8Lx10CKjdVy7Vy12t832U1Aemw8U_OD0HyTi5v41NVVsubieLBnrzx2RWMKppEMwMtW1KErUFqudUv5pNH01OVMoO-7y2tWYwAobN0dFHE9gsZivD2pjXBz69jMqU_NqQbAo8P_4i6XMK3Q1J0HaCgYKAdgSARMSFQHGX2MiB4HuiLhm9KQFr8dpw28O3g0175",
//   "refresh_token": "1//0ewEnP-DP6BqlCgYIARAAGA4SNwF-L9IrT89njNo7fWxM6wHA6eaUH43B9iNa-AmYcPUw1cA1TUNa9ZqM9NgiUfMidQbnD3-UF2w",
//   "scope": "https://www.googleapis.com/auth/calendar",
//   "token_type": "Bearer",
//   "expiry_date": 1726505984080
// }
