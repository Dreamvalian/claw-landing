import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Onyx",
  description: "Privacy Policy for Onyx by Koala.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-neutral-500 mb-8">Last updated: April 2026</p>

      <div className="space-y-8 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="mb-3">We collect the following information:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Discord Account Information:</strong> When you authenticate via Discord OAuth, we receive your Discord user ID, username, avatar, and email address.</li>
            <li><strong>Session Data:</strong> We maintain session information to keep you logged in.</li>
            <li><strong>Usage Data:</strong> We log commands, responses, and interactions with the Service for troubleshooting and improvement.</li>
            <li><strong>Device Information:</strong> Basic browser and device data may be collected automatically.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Provide and maintain the Service</li>
            <li>Authenticate your access via Discord OAuth</li>
            <li>Improve and personalize your experience</li>
            <li>Monitor Service usage and fix issues</li>
            <li>Send you important updates and notifications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Data Storage and Security</h2>
          <p>
            Data is stored on secure servers operated by Koala. Discord OAuth authentication is handled by Discord&apos;s platform — we do not store your Discord password. We implement reasonable security measures to protect your data, but no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to maintain your session and remember your preferences (such as theme settings). We do not use third-party advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Third-Party Services</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Discord:</strong> Used for OAuth authentication. Discord&apos;s privacy policy applies to their data handling.</li>
            <li><strong>AI Providers:</strong> Queries may be processed by third-party AI services. Their privacy policies govern their data practices.</li>
            <li><strong>Hosting Provider:</strong> Server infrastructure used to host the Service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Data Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share data when required by law, to protect our rights, or to comply with legal obligations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your data</li>
            <li>Object to or restrict certain processing</li>
            <li>Data portability</li>
          </ul>
          <p className="mt-2">To exercise these rights, contact Koala via Discord.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Children&apos;s Privacy</h2>
          <p>
            The Service is not intended for users under 13 years old. We do not knowingly collect data from minors. If we become aware that a minor&apos;s data has been collected, we will delete it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active or as needed to provide the Service. Session logs and usage data are retained for a limited period for troubleshooting purposes. You may request deletion of your data at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. International Transfers</h2>
          <p>
            Your data may be transferred and processed in countries outside your own. We take reasonable steps to ensure such transfers are conducted securely and in compliance with applicable data protection laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &ldquo;Last updated&rdquo; date. Continued use of the Service after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">12. Contact</h2>
          <p>
            For privacy-related questions or to exercise your rights, contact Koala via Discord or the channels provided at ko4lax.dev/contact.
          </p>
        </section>
      </div>
    </div>
  )
}
