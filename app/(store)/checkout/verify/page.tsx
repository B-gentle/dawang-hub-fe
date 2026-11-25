import MonnifyCallbackVerifier from "@/components/checkout/MonnifyCallbackVerifier";

export default function VerifyPaymentPage() {
  return <MonnifyCallbackVerifier defaultFlow="ORDER_CHECKOUT" />;
}
