
import React from "react";

const TermsOfService: React.FC = () => (
  <div className="max-w-2xl mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
    <p className="mb-4">
      By using TrackerHub, you agree to the following terms:
    </p>
    <ol className="list-decimal list-inside mb-4 space-y-2">
      <li>You must be at least 13 years old to use our services.</li>
      <li>Do not misuse the service, exploit vulnerabilities, or use it for illegal activities.</li>
      <li>We may suspend accounts for violating these rules.</li>
      <li>These terms may update; continued use means acceptance of changes.</li>
    </ol>
    <p>
      For questions about these terms, email us at: support@trackerhub.com.
    </p>
  </div>
);

export default TermsOfService;
