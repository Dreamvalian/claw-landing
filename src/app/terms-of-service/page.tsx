import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — Onyx",
  description: "Terms of Service for Onyx by Koala.",
}

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-neutral-500 mb-8">Last updated: April 2026</p>

      <div className="space-y-8 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Onyx (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
          <p>
            Onyx is a personal AI assistant operated by Koala. The Service provides AI-powered conversation, task automation, and related features accessible via web interface at ko4lax.dev and dashboard.ko4lax.dev.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Eligibility</h2>
          <p>
            You must have a valid Discord account to authenticate and access the Service. You must be at least 13 years old. By using the Service, you represent that you meet these requirements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. User Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Use the Service for any unlawful or prohibited purpose</li>
            <li>Attempt to gain unauthorized access to any systems</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Use automated tools to scrape, harvest, or extract data from the Service</li>
            <li>Reverse engineer, decompile, or disassemble the Service</li>
            <li>Impersonate any person or entity</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
          <p>
            The Service, including its design, logos, trademarks, and content, is owned by Koala unless otherwise stated. You retain ownership of content you submit but grant Koala a non-exclusive license to use it in connection with the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. Koala does not guarantee that the Service will be uninterrupted, secure, or error-free.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Koala shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Modifications to the Service</h2>
          <p>
            Koala reserves the right to modify, suspend, or discontinue the Service at any time without notice. Prices for any paid features may also change at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
          <p>
            Koala may terminate or suspend your access to the Service at any time, for any reason, including if you violate these Terms. Upon termination, your right to use the Service ceases immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved under the applicable legal framework.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
          <p>
            For questions about these Terms, contact Koala via Discord or the channels provided at ko4lax.dev/contact.
          </p>
        </section>
      </div>
    </div>
  )
}
