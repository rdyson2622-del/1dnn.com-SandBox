import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Effective Date: May 1, 2026</p>

        <p className="text-gray-700 mb-6">
          The Dyson and Dyson Companies, Inc. ("we," "us," or "our") respects your privacy. This Privacy Policy explains how we collect and use your information when you join our Private Referral Network.
        </p>

        <div className="space-y-5 text-gray-700 leading-relaxed">

          <div>
            <h2 className="font-bold text-gray-900">1. Information Collection</h2>
            <p>We collect your name, brokerage information, and mobile phone number exclusively for the purpose of managing real estate referrals and transaction logistics.</p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900">2. SMS Communication</h2>
            <p>By providing your phone number, you consent to receive text messages regarding referral opportunities, vetting status, and transaction milestones.</p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900">3. Third-Party Sharing</h2>
            <p>No mobile information will be shared with third parties/affiliates for marketing or promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.</p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900">4. Security</h2>
            <p>We implement industry-standard security measures to protect your data.</p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900">5. Opt-Out</h2>
            <p>You may text "STOP" at any time to cancel SMS communications.</p>
          </div>

        </div>
      </div>
    </div>
  );
}