import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Effective Date: May 1, 2026</p>

        <p className="text-gray-700 mb-6">
          By accessing the DysonRelo.com Private Referral Network, you agree to the following:
        </p>

        <div className="space-y-5 text-gray-700 leading-relaxed">

          <div>
            <h2 className="font-bold text-gray-900">1. Program Description</h2>
            <p>Dyson & Dyson provides a managed referral platform for independent real estate brokers. Communications may include referral invitations, vetting requirements, and closing updates.</p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900">2. Message Frequency</h2>
            <p>Message frequency varies based on active referral volume.</p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900">3. Fees</h2>
            <p>Dyson & Dyson does not charge agents a fee to receive messages; however, standard message and data rates from your carrier may apply.</p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900">4. Participation</h2>
            <p>Participation is limited to licensed real estate professionals.</p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900">5. Managed Fees</h2>
            <p>You acknowledge the 25/10/35 referral fee structure as outlined in the specific Managed Referral Agreements for each transaction.</p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900">6. Support</h2>
            <p>For support, reply "HELP" or contact us at our office via <a href="https://dysonrelo.com" className="underline text-blue-600">dysonrelo.com</a>.</p>
          </div>

          <div>
            <h2 className="font-bold text-gray-900">7. Termination</h2>
            <p>You may opt out by texting "STOP" to our short code or long code number at any time.</p>
          </div>

        </div>
      </div>
    </div>
  );
}