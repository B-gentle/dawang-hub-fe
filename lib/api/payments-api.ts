import { fetcher } from "./fetcher";

export type PaymentReason = "ORDER_CHECKOUT" | "VENDOR_SETUP";

export interface BankItem {
  name: string;
  code: string;
}

export interface ResolvedBankAccount {
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

export interface InitializeMonnifyPayload {
  reason: PaymentReason;
  orderId?: string;
  planId?: string;
  draftId?: string;
}

export interface InitializeMonnifyResponse {
  checkoutUrl: string;
  transactionReference: string;
  paymentReference: string;
}

export interface VerifyMonnifyResponse {
  status: string;
  reason: PaymentReason;
  transactionReference: string;
  paymentReference: string;
  amountPaid: number;
  orderId?: string;
}

export const paymentsApi = {
  getBanks: () => fetcher<BankItem[]>("/payments/banks"),

  resolveAccount: (accountNumber: string, bankCode: string) =>
    fetcher<ResolvedBankAccount>(
      `/payments/resolve-account?accountNumber=${encodeURIComponent(accountNumber)}&bankCode=${encodeURIComponent(bankCode)}`,
    ),

  initializeMonnify: (payload: InitializeMonnifyPayload) =>
    fetcher<InitializeMonnifyResponse>("/payments/monnify/initialize", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyMonnify: (paymentReference: string) =>
    fetcher<VerifyMonnifyResponse>(
      `/payments/monnify/verify?paymentReference=${encodeURIComponent(paymentReference)}`,
    ),
};
