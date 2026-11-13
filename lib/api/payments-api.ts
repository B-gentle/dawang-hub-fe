import { fetcher } from "./fetcher";

export interface BankItem {
  name: string;
  code: string;
}

export interface ResolvedBankAccount {
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

export const paymentsApi = {
  getBanks: () => fetcher<BankItem[]>("/payments/banks"),

  resolveAccount: (accountNumber: string, bankCode: string) =>
    fetcher<ResolvedBankAccount>(
      `/payments/resolve-account?accountNumber=${encodeURIComponent(accountNumber)}&bankCode=${encodeURIComponent(bankCode)}`,
    ),

  initializeMonnify: (orderId: string) =>
    fetcher<{
      checkoutUrl: string;
      transactionReference: string;
      paymentReference: string;
    }>(`/payments/monnify/initialize/${orderId}`, {
      method: "POST",
    }),
};
