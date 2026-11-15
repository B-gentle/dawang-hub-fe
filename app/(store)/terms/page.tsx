import LegalDocumentView from "@/components/common/LegalDocumentView";
import { DEFAULT_TERMS_HTML } from "@/lib/legal-defaults";

export default function TermsAndConditionsPage() {
  return (
    <LegalDocumentView
      badge="LEGAL AGREEMENT"
      title="Terms & Conditions"
      field="termsAndConditions"
      defaultHtml={DEFAULT_TERMS_HTML}
      alternateLink={{ href: "/privacy", label: "Read Privacy Policy" }}
    />
  );
}
