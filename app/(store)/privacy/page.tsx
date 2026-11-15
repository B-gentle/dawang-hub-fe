import LegalDocumentView from "@/components/common/LegalDocumentView";
import { DEFAULT_PRIVACY_HTML } from "@/lib/legal-defaults";

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentView
      badge="DATA PROTECTION"
      title="Privacy Policy"
      field="privacyPolicy"
      defaultHtml={DEFAULT_PRIVACY_HTML}
      alternateLink={{ href: "/terms", label: "Read Terms & Conditions" }}
    />
  );
}
