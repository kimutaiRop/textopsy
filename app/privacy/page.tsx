import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowLeft, IconLogo } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Textopsy - Message Autopsy Analysis Service",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors mb-6"
          >
            <IconArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <IconLogo className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-gray-400 text-sm mb-2">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-gray-500 text-xs">Textopsy is a product of Velinex. Service available at https://textopsy.velinexlabs.com/</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                At Textopsy, a product of Velinex, we are committed to protecting your privacy and safeguarding your personal 
                information. This Privacy Policy ("Policy", "Privacy Policy") explains how we collect, use, disclose, store, 
                share, protect, and safeguard your information when you access or use our message analysis service accessible 
                at https://textopsy.velinexlabs.com/ (the "Service", "Platform", "Website", "we", "us", "our").
              </p>
              <p className="text-gray-300 leading-relaxed">
                This Privacy Policy applies to all visitors, users, subscribers, and all other persons who access or use the Service 
                ("Users", "you", "your"). By accessing, browsing, registering for, creating an account with, subscribing to, or 
                otherwise using the Service in any manner whatsoever, you acknowledge that you have read, understood, and agree to 
                be bound by this Privacy Policy and our data collection, use, and disclosure practices as described herein.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong>If you do not agree with the terms of this Privacy Policy, please do not access or use the Service.</strong> 
                Your continued use of the Service after any modifications to this Privacy Policy constitutes your acceptance of the 
                modified Privacy Policy.
              </p>
              <p className="text-gray-300 leading-relaxed">
                This Privacy Policy is incorporated by reference into our Terms and Conditions, which govern your use of the Service. 
                Please read both documents carefully. In the event of any conflict between this Privacy Policy and our Terms and 
                Conditions, the Terms and Conditions shall control to the extent of such conflict.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices, the Service, technology, 
                legal requirements, or for other reasons. We will notify you of material changes as described in Section 11 below.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                We collect information that you provide directly to us, information that is automatically collected when you use 
                the Service, and information that we may receive from third parties. The types and amount of information we collect 
                depend on how you use the Service and what features you access.
              </p>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">2.1 Information You Provide Directly to Us</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">2.1.1 Account Registration Information</h4>
                    <p className="text-gray-300 leading-relaxed mb-2">When you register for an account, we collect:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                      <li><strong>Email Address:</strong> Your email address is required for account creation, authentication, 
                      communication, and account recovery purposes</li>
                      <li><strong>Password:</strong> Your password is encrypted and hashed using industry-standard security 
                      practices. We do not store your password in plain text and cannot retrieve your original password. You are 
                      responsible for maintaining the confidentiality of your password</li>
                      <li><strong>Profile Information:</strong> Optional profile information you may provide, such as gender, 
                      preferences, or other demographic information, which helps us personalize the Service and provide relevant 
                      analysis</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">2.1.2 Content and Conversation Data</h4>
                    <p className="text-gray-300 leading-relaxed mb-2">When you use the Service to analyze conversations, we collect:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                      <li><strong>Text Messages:</strong> The text content of conversations, messages, or chat threads that you 
                      submit for analysis, including message content, timestamps, sender/receiver information, and any metadata 
                      associated with the messages</li>
                      <li><strong>Screenshots and Images:</strong> Screenshots or images of conversations that you upload, 
                      including image data, file metadata, timestamps, and any text or content extracted from images</li>
                      <li><strong>Conversation Context:</strong> Any additional context, background information, clarification 
                      answers, or supplementary details you provide to enhance the analysis</li>
                      <li><strong>Analysis Preferences:</strong> Your preferences for analysis personas, perspectives, settings, 
                      and other configuration options</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">2.1.3 Analysis Results and Generated Content</h4>
                    <p className="text-gray-300 leading-relaxed mb-2">
                      We store the results of AI analysis generated for your conversations, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                      <li>Generated insights, analysis, feedback, recommendations, and interpretations</li>
                      <li>Analysis scores, ratings, assessments, and evaluations</li>
                      <li>Analysis history, saved conversations, and associated metadata</li>
                      <li>User preferences, settings, and analysis configurations</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">2.1.4 Payment and Subscription Information</h4>
                    <p className="text-gray-300 leading-relaxed mb-2">
                      When you subscribe to a premium plan or make payments, we collect:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                      <li>Subscription plan details, billing cycle, and subscription status</li>
                      <li>Transaction information, transaction IDs, payment amounts, and payment dates received from our 
                      payment processor (Paystack)</li>
                      <li>Payment metadata necessary to manage your subscription and provide billing support</li>
                      <li><strong>Note:</strong> We do not store or have access to your full payment card details, credit card 
                      numbers, debit card numbers, CVV codes, expiration dates, or other sensitive payment information. All 
                      payment information is processed directly by our third-party payment processor (see Section 4.1)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">2.1.5 Communications and Support</h4>
                    <p className="text-gray-300 leading-relaxed mb-2">
                      When you contact us for support, assistance, or inquiries, we may collect:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                      <li>Your name, email address, and contact information</li>
                      <li>Information about your inquiry, issue, or request</li>
                      <li>Account information and Service usage details relevant to your inquiry</li>
                      <li>Correspondence, messages, and communications between you and our support team</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">2.2 Automatically Collected Information</h3>
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    When you access or use the Service, we automatically collect certain information about your device, usage, 
                    and interactions with the Service. This information is collected through various technologies, including cookies, 
                    web beacons, log files, and similar tracking technologies.
                  </p>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">2.2.1 Usage and Analytics Data</h4>
                    <p className="text-gray-300 leading-relaxed mb-2">We collect information about how you use the Service, including:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                      <li>Pages visited, features used, and actions taken within the Service</li>
                      <li>Time spent on pages and features, click patterns, and navigation paths</li>
                      <li>Analysis requests, submission frequency, and usage patterns</li>
                      <li>Feature usage statistics, preferences, and service interactions</li>
                      <li>Error messages, issues encountered, and technical problems</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">2.2.2 Device and Technical Information</h4>
                    <p className="text-gray-300 leading-relaxed mb-2">We collect information about your device and technical environment, including:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                      <li><strong>Device Information:</strong> Device type, model, operating system, and device identifiers</li>
                      <li><strong>Browser Information:</strong> Browser type, version, language settings, and browser extensions</li>
                      <li><strong>IP Address:</strong> Your Internet Protocol (IP) address, which may be used to determine your 
                      approximate geographic location, prevent fraud, and ensure security</li>
                      <li><strong>Network Information:</strong> Internet service provider (ISP), network type, and connection 
                      quality</li>
                      <li><strong>Screen Resolution and Display:</strong> Screen size, resolution, color depth, and display 
                      settings</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">2.2.3 Session and Authentication Data</h4>
                    <p className="text-gray-300 leading-relaxed mb-2">We collect information about your sessions and authentication, including:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                      <li>Session identifiers, session tokens, and authentication tokens</li>
                      <li>Login timestamps, session duration, and session activity</li>
                      <li>Account access patterns, login frequency, and authentication events</li>
                      <li>Logout events and session termination information</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">2.2.4 Log Files and Error Information</h4>
                    <p className="text-gray-300 leading-relaxed mb-2">
                      We automatically collect log files and error information, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                      <li>Server logs, access logs, and application logs</li>
                      <li>Error messages, exception traces, and stack traces</li>
                      <li>Technical diagnostic information for troubleshooting and debugging</li>
                      <li>Performance metrics, response times, and system health data</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">2.2.5 Cookies and Tracking Technologies</h4>
                    <p className="text-gray-300 leading-relaxed mb-2">
                      We use cookies, local storage, web beacons, and similar technologies to collect information (see Section 9 
                      for more details), including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                      <li>Authentication cookies to maintain your login session</li>
                      <li>Preference cookies to remember your settings and preferences</li>
                      <li>Analytics cookies to understand Service usage and improve performance</li>
                      <li>Security cookies to protect against fraud and unauthorized access</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">2.3 Information from Third Parties</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We may receive information about you from third-party services and providers, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong>Payment Processors:</strong> Transaction confirmations, payment status, and limited payment metadata 
                  from Paystack (see Section 4.1)</li>
                  <li><strong>AI Service Providers:</strong> Processing confirmations, analysis metadata, and technical information 
                  from Google AI (see Section 4.2)</li>
                  <li><strong>Analytics Providers:</strong> Aggregated usage statistics, analytics data, and performance metrics</li>
                  <li><strong>Security Services:</strong> Fraud detection data, security alerts, and threat intelligence</li>
                  <li><strong>Hosting and Infrastructure Providers:</strong> Server logs, infrastructure metrics, and technical 
                  diagnostic data</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-3">
                  We are not responsible for the accuracy or completeness of information received from third parties, and such 
                  information is subject to the privacy practices and terms of those third parties.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                We use the information we collect for various purposes to provide, operate, maintain, improve, and enhance the Service, 
                to communicate with you, to ensure security and prevent fraud, and to comply with legal obligations. We only use your 
                information as described in this Privacy Policy or as otherwise disclosed to you at the time of collection.
              </p>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">3.1 Service Provision and Operation</h3>
                <p className="text-gray-300 leading-relaxed mb-3">We use your information to provide, operate, and maintain the Service, including:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong>Account Management:</strong> Creating, managing, and maintaining your account, authenticating your 
                  identity, and providing access to the Service</li>
                  <li><strong>Service Functionality:</strong> Processing your analysis requests, generating insights, and providing 
                  AI-powered analysis and feedback</li>
                  <li><strong>Content Processing:</strong> Processing, analyzing, and storing your conversation data and content 
                  using third-party AI services (Google Gemini AI)</li>
                  <li><strong>Result Storage:</strong> Storing analysis results, conversation history, and associated data for 
                  your access and reference</li>
                  <li><strong>Feature Delivery:</strong> Enabling features, functionality, and services based on your subscription 
                  plan and preferences</li>
                  <li><strong>Personalization:</strong> Personalizing your experience, recommendations, and analysis based on your 
                  preferences, usage patterns, and profile information</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">3.2 Subscription and Billing Management</h3>
                <p className="text-gray-300 leading-relaxed mb-3">We use your information to manage subscriptions and billing, including:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Processing subscription purchases, renewals, upgrades, and downgrades</li>
                  <li>Managing billing cycles, payment processing, and transaction records</li>
                  <li>Communicating subscription status, billing information, and renewal reminders</li>
                  <li>Handling payment disputes, refunds (if applicable), and billing inquiries</li>
                  <li>Enforcing subscription limits, quotas, and usage restrictions</li>
                  <li>Providing billing support and customer service</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">3.3 Communication</h3>
                <p className="text-gray-300 leading-relaxed mb-3">We use your information to communicate with you, including:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong>Service Communications:</strong> Sending service-related communications, such as account verification 
                  emails, password reset notifications, subscription confirmations, and billing updates</li>
                  <li><strong>Security Alerts:</strong> Notifying you of security events, unauthorized access attempts, or account 
                  activity</li>
                  <li><strong>Service Updates:</strong> Informing you about Service changes, updates, new features, or maintenance</li>
                  <li><strong>Support:</strong> Responding to your inquiries, providing customer support, and addressing technical 
                  issues</li>
                  <li><strong>Legal Notices:</strong> Sending legal notices, privacy policy updates, terms changes, or required 
                  disclosures</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-3">
                  <strong>Marketing Communications:</strong> We do not use your personal information for marketing purposes without 
                  your explicit consent. You may opt-out of marketing communications at any time, if applicable.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">3.4 Service Improvement and Analytics</h3>
                <p className="text-gray-300 leading-relaxed mb-3">We use your information to improve and enhance the Service, including:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Analyzing usage patterns, trends, and service performance to improve functionality and user experience</li>
                  <li>Monitoring service quality, reliability, and availability</li>
                  <li>Identifying and fixing bugs, errors, and technical issues</li>
                  <li>Developing new features, functionality, and services</li>
                  <li>Optimizing performance, speed, and efficiency</li>
                  <li>Conducting research, testing, and analytics to enhance service capabilities</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-3">
                  <strong>Aggregated Data:</strong> We may use aggregated, anonymized, or de-identified data for analytics, 
                  research, and service improvement purposes that does not identify you individually.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">3.5 Security and Fraud Prevention</h3>
                <p className="text-gray-300 leading-relaxed mb-3">We use your information to protect the Service and prevent fraud, including:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Detecting, preventing, and responding to security threats, unauthorized access, and fraudulent activity</li>
                  <li>Verifying your identity and authenticating your account</li>
                  <li>Monitoring for suspicious activity, abuse, and violations of our Terms</li>
                  <li>Enforcing security policies, usage limits, and access controls</li>
                  <li>Investigating security incidents, data breaches, and suspicious behavior</li>
                  <li>Protecting against spam, malware, phishing, and other security risks</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">3.6 Legal Compliance and Dispute Resolution</h3>
                <p className="text-gray-300 leading-relaxed mb-3">We use your information to comply with legal obligations and resolve disputes, including:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Complying with applicable laws, regulations, court orders, and legal processes</li>
                  <li>Responding to law enforcement requests, subpoenas, and government inquiries</li>
                  <li>Enforcing our Terms and Conditions, Privacy Policy, and other agreements</li>
                  <li>Protecting our rights, property, and interests, and those of our Users and third parties</li>
                  <li>Resolving disputes, claims, and legal proceedings</li>
                  <li>Meeting reporting, record-keeping, and compliance requirements</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">3.7 Third-Party Service Integration</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We use your information to integrate with and use third-party services, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Transmitting your Content to Google Gemini AI for AI analysis and processing (see Section 4.2)</li>
                  <li>Providing payment information to Paystack for payment processing and subscription management (see Section 4.1)</li>
                  <li>Using third-party services for hosting, analytics, email delivery, security, and other functions</li>
                  <li>Sharing information with third-party service providers as necessary to provide the Service</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services and Data Sharing</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">4.1 Payment Processing - Paystack</h3>
                <p className="text-gray-300 leading-relaxed">
                  We use <strong>Paystack</strong> as our payment processor. When you make a payment, your payment information 
                  (including credit card details) is collected and processed directly by Paystack. We do not store your full 
                  payment card information on our servers. Paystack may collect, use, and share your payment information in 
                  accordance with Paystack's Privacy Policy and applicable laws. We strongly encourage you to visit Paystack's 
                  website (paystack.com) to review their Privacy Policy to understand what payment information they collect, how 
                  they use it, how they store it, and how they protect it. We receive transaction confirmations and limited 
                  payment metadata (such as transaction IDs and amounts) from Paystack to manage your subscription. We are not 
                  responsible for Paystack's privacy practices or data handling.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">4.2 AI Services - Google Gemini</h3>
                <p className="text-gray-300 leading-relaxed">
                  Our analysis capabilities are powered by <strong>Google Gemini AI</strong> (Google AI services). When you submit 
                  content for analysis, it is processed by Google's AI infrastructure. This means your conversation data and content 
                  may be transmitted to and processed by Google's servers. Google's use of your data is subject to their AI Terms 
                  of Service and Privacy Policy. We strongly encourage you to visit Google's websites (including ai.google.dev and 
                  policies.google.com) to review their AI Terms of Service, Privacy Policy, and data practices to understand what 
                  data they collect, how they use it, how they process your content, and how they protect it. 
                  We take reasonable measures to protect your data, but please be aware that third-party services have their own privacy 
                  practices over which we have limited control.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">4.3 Other Third-Party Services</h3>
                <div className="space-y-3">
                  <p className="text-gray-300 leading-relaxed">
                    We may use other third-party services for various functions to provide, operate, maintain, and improve the 
                    Service, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                    <li><strong>Hosting and Cloud Infrastructure:</strong> Third-party hosting and cloud service providers for 
                    storing, processing, and serving the Service and your data</li>
                    <li><strong>Database Services:</strong> Third-party database services for storing and managing your information</li>
                    <li><strong>Email Delivery:</strong> Third-party email service providers for sending service-related 
                    communications and notifications</li>
                    <li><strong>Analytics:</strong> Third-party analytics services for understanding usage patterns, performance, 
                    and service quality</li>
                    <li><strong>Security and Monitoring:</strong> Third-party security and monitoring services for detecting 
                    threats, preventing fraud, and ensuring security</li>
                    <li><strong>Technical Support:</strong> Third-party support services for providing customer support and 
                    technical assistance</li>
                  </ul>
                  <p className="text-gray-300 leading-relaxed mb-3">
                    These third-party services may have access to limited information necessary to perform their functions, 
                    including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                    <li>Technical information, server logs, and infrastructure data</li>
                    <li>Aggregated, anonymized, or de-identified usage data</li>
                    <li>Account information necessary for service delivery</li>
                    <li>Information required for security, monitoring, and support purposes</li>
                  </ul>
                  <p className="text-gray-300 leading-relaxed">
                    These third-party services are contractually prohibited from using your information for any purpose other than 
                    providing the services we have engaged them for. However, we are not responsible for how these third parties 
                    handle your information, and their use of your information is subject to their own privacy policies and terms. 
                    We encourage you to review their privacy policies to understand their data practices.
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">4.4 Data Sharing Limitations and Your Control</h3>
                <div className="space-y-3">
                  <p className="text-gray-300 leading-relaxed mb-3">
                    <strong>We do not sell, rent, or trade your personal information to third parties for marketing purposes.</strong> 
                    We only share your information as described in this Privacy Policy or with your explicit consent. We may share 
                    your information in the following limited circumstances:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                    <li><strong>Service Provision:</strong> With third-party service providers as necessary to provide, operate, 
                    maintain, and improve the Service, subject to their contractual obligations to protect your information</li>
                    <li><strong>Legal Requirements:</strong> When required by law, regulation, court order, or legal process, 
                    or to respond to law enforcement or government requests</li>
                    <li><strong>Protection of Rights:</strong> When necessary to protect our rights, property, or interests, or 
                    those of our Users or third parties, including enforcing our Terms and Conditions or investigating fraud or 
                    security issues</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, sale of assets, or 
                    bankruptcy, where your information may be transferred to the acquiring entity, subject to their privacy 
                    policy and your consent if required by law</li>
                    <li><strong>Consent:</strong> With your explicit consent or at your direction</li>
                  </ul>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>Aggregated and Anonymized Data:</strong> We may share aggregated, anonymized, or de-identified data 
                    that does not identify you individually for analytics, research, or service improvement purposes. This data 
                    cannot be used to identify you personally.
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">4.5 Third-Party Liability Disclaimer</h3>
                <p className="text-gray-300 leading-relaxed">
                  <strong>We are not responsible for the privacy practices, data handling, security, or terms of third-party 
                  services.</strong> Your use of the Service involves interaction with third-party services, and your information 
                  may be subject to their privacy policies and data practices. We disclaim all liability for any loss, damage, 
                  or harm arising from or related to third-party services, including data breaches, privacy violations, security 
                  incidents, or service failures by third parties. Your sole recourse for issues with third-party services is 
                  with those third parties, not Textopsy.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Storage and Security</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">5.1 Security Measures</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We implement appropriate technical, organizational, and administrative measures to protect your personal information 
                  against unauthorized access, use, disclosure, alteration, destruction, or loss. However, no method of transmission 
                  over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
                <div>
                  <h4 className="text-lg font-semibold mb-2">5.1.1 Technical Security Measures</h4>
                  <p className="text-gray-300 leading-relaxed mb-2">We employ various technical security measures, including:</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li><strong>Encryption in Transit:</strong> All data transmitted between your device and our servers is encrypted 
                    using industry-standard Transport Layer Security (TLS) or Secure Sockets Layer (SSL) protocols (HTTPS)</li>
                    <li><strong>Encryption at Rest:</strong> Sensitive data stored on our servers is encrypted at rest using 
                    industry-standard encryption algorithms and key management practices</li>
                    <li><strong>Password Security:</strong> Passwords are hashed using industry-standard cryptographic hash functions 
                    (such as bcrypt or Argon2) with salt. We never store passwords in plain text and cannot retrieve your original 
                    password</li>
                    <li><strong>Authentication Mechanisms:</strong> Multi-factor authentication, secure session management, and 
                    authentication tokens to verify your identity and protect your account</li>
                    <li><strong>Access Controls:</strong> Role-based access controls, least-privilege principles, and access logs 
                    to restrict access to your information to authorized personnel only</li>
                    <li><strong>Network Security:</strong> Firewalls, intrusion detection systems, DDoS protection, and network 
                    segmentation to protect against unauthorized access and attacks</li>
                    <li><strong>Secure Coding Practices:</strong> Secure software development practices, code reviews, vulnerability 
                    scanning, and security testing to prevent security vulnerabilities</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">5.1.2 Organizational Security Measures</h4>
                  <p className="text-gray-300 leading-relaxed mb-2">We implement organizational security measures, including:</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>Security policies, procedures, and training for personnel who have access to your information</li>
                    <li>Background checks and confidentiality agreements for employees and contractors</li>
                    <li>Regular security assessments, audits, and penetration testing</li>
                    <li>Incident response procedures and data breach notification protocols</li>
                    <li>Regular updates, patches, and security fixes for systems and software</li>
                    <li>Data backup, disaster recovery, and business continuity plans</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">5.2 Data Storage Locations</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Your information is stored on secure servers operated by us or our third-party hosting and cloud infrastructure 
                  providers. Your information may be stored in data centers located in various countries and jurisdictions, 
                  including countries outside your country of residence. The specific storage locations depend on various factors, 
                  including the type of information, the Service features you use, and our operational requirements.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  By using the Service, you consent to the storage and processing of your information in these locations, which may 
                  have data protection laws that differ from those in your country of residence. We implement appropriate safeguards 
                  to protect your information regardless of where it is stored or processed.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">5.3 Security Limitations and Your Responsibility</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  <strong>While we strive to protect your information, no security measures are perfect or impenetrable.</strong> 
                  We cannot guarantee that your information will be secure from unauthorized access, use, disclosure, alteration, 
                  destruction, or loss. You are also responsible for taking reasonable steps to protect your information, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>Using a strong, unique password for your account and not sharing it with others</li>
                  <li>Logging out of your account when using shared or public devices or networks</li>
                  <li>Not sharing your account credentials or allowing others to access your account</li>
                  <li>Keeping your device, browser, and software up to date with security patches and updates</li>
                  <li>Using antivirus software, firewalls, and other security measures on your device</li>
                  <li>Being cautious about phishing attempts, suspicious emails, and fraudulent websites</li>
                  <li>Notifying us immediately if you suspect unauthorized access to your account</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  <strong>You are responsible for all activities that occur under your account, whether authorized or unauthorized.</strong> 
                  If you become aware of any unauthorized access, use, or disclosure of your information, please notify us immediately 
                  through the Service or our support channels.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">5.4 Data Breach Notification</h3>
                <p className="text-gray-300 leading-relaxed">
                  In the event of a data breach that affects your personal information, we will notify you as required by applicable 
                  law. Notification may be provided by email, through the Service, or other means as required by law. We will also 
                  take appropriate steps to investigate, mitigate, and remedy any security incidents or data breaches. However, we 
                  are not liable for any loss, damage, or harm arising from unauthorized access, use, or disclosure of your 
                  information, except as required by applicable law.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3">6.1 Retention Period</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We retain your personal information for as long as necessary to provide the Service, fulfill the purposes described 
                  in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. The specific 
                  retention period depends on the type of information and the purposes for which it was collected.
                </p>
                <p className="text-gray-300 leading-relaxed mb-3">
                  <strong>Active Accounts:</strong> While your account is active, we retain your personal information, Content, 
                  analysis results, and associated data to provide the Service and maintain your account.
                </p>
                <p className="text-gray-300 leading-relaxed mb-3">
                  <strong>Inactive Accounts:</strong> If your account is inactive for an extended period, we may archive or delete 
                  certain information, subject to our data retention policies and legal obligations.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  <strong>Deleted Accounts:</strong> When you delete your account, we will delete or anonymize your personal 
                  information, Content, and associated data, except where we are required to retain it for legal, regulatory, 
                  accounting, or dispute resolution purposes. Deletion may not be immediate and may take up to 30 days or longer 
                  depending on the type of information and technical requirements.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">6.2 Retention Exceptions</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We may retain certain information even after you delete your account or request deletion, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li><strong>Legal Requirements:</strong> Information required to be retained by applicable laws, regulations, 
                  court orders, or legal processes</li>
                  <li><strong>Regulatory Compliance:</strong> Information required for regulatory compliance, audits, or 
                  investigations</li>
                  <li><strong>Accounting Records:</strong> Financial and billing information required for accounting, tax, or 
                  audit purposes</li>
                  <li><strong>Dispute Resolution:</strong> Information necessary to resolve disputes, enforce agreements, or 
                  protect our rights</li>
                  <li><strong>Security and Fraud Prevention:</strong> Information necessary to prevent fraud, abuse, or security 
                  threats</li>
                  <li><strong>Backup and Recovery:</strong> Information in backups, archives, or disaster recovery systems that 
                  may be retained for technical or operational reasons</li>
                  <li><strong>Aggregated and Anonymized Data:</strong> Aggregated, anonymized, or de-identified data that does 
                  not identify you individually may be retained indefinitely for analytics, research, or service improvement purposes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">6.3 Data Deletion Requests</h3>
                <p className="text-gray-300 leading-relaxed">
                  If you request deletion of your personal information, we will delete it in accordance with this Privacy Policy 
                  and applicable law, subject to the retention exceptions described above. To request deletion of your information, 
                  please contact us through the Service or our support channels. We will respond to your request within a reasonable 
                  timeframe as required by applicable law.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Privacy Rights</h2>
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed mb-4">
                Depending on your location and applicable data protection laws, you may have certain rights regarding your personal 
                information. These rights may vary depending on your jurisdiction and the specific laws applicable to you.
              </p>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">7.1 Access Rights</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  You have the right to request access to your personal information, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Information about what personal information we hold about you</li>
                  <li>Copies of your personal information, Content, and analysis results</li>
                  <li>Information about how we use, process, and share your information</li>
                  <li>Information about third parties with whom we share your information</li>
                  <li>Information about the legal basis for processing your information</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">7.2 Correction and Update Rights</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  You have the right to request correction or updating of inaccurate or incomplete personal information, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Correcting inaccurate account information, profile information, or other personal information</li>
                  <li>Updating outdated or incomplete information</li>
                  <li>Amending or supplementing information that is incomplete</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-3">
                  You can update some of your information directly through your account settings. For information that cannot be 
                  updated through your account, please contact us.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">7.3 Deletion Rights</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  You have the right to request deletion of your personal information, subject to certain exceptions, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Deletion of your account and associated personal information</li>
                  <li>Deletion of your Content, analysis results, and associated data</li>
                  <li>Deletion of information that is no longer necessary for the purposes for which it was collected</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mt-3">
                  However, we may retain certain information as required by law or as described in Section 6.2 (Retention Exceptions).
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">7.4 Data Portability Rights</h3>
                <p className="text-gray-300 leading-relaxed">
                  You have the right to request a copy of your personal information in a structured, commonly used, and 
                  machine-readable format, and to request that we transfer your information to another service provider where 
                  technically feasible. This right applies to information you provided to us and information processed based on 
                  your consent or for the performance of a contract.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">7.5 Opt-Out and Restriction Rights</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong>Opt-Out of Marketing:</strong> Opt-out of marketing communications, promotional emails, or other 
                  marketing activities (if applicable)</li>
                  <li><strong>Opt-Out of Cookies:</strong> Opt-out of certain cookies and tracking technologies through your 
                  browser settings (see Section 9)</li>
                  <li><strong>Restrict Processing:</strong> Request restriction of processing of your personal information in 
                  certain circumstances, such as when you contest the accuracy of the information or object to processing</li>
                  <li><strong>Object to Processing:</strong> Object to processing of your personal information based on legitimate 
                  interests or for direct marketing purposes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">7.6 Consent Withdrawal Rights</h3>
                <p className="text-gray-300 leading-relaxed">
                  Where processing of your personal information is based on your consent, you have the right to withdraw your 
                  consent at any time. Withdrawal of consent does not affect the lawfulness of processing based on consent before 
                  its withdrawal. However, withdrawing consent may affect your ability to use certain features of the Service.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">7.7 Exercising Your Rights</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  To exercise your privacy rights, please contact us through the Service or our support channels. When you make a 
                  request, we may:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>Verify your identity to ensure the request is authorized and protect your privacy</li>
                  <li>Request additional information to process your request</li>
                  <li>Respond to your request within a reasonable timeframe as required by applicable law (typically within 30 
                  days, but may be extended in certain circumstances)</li>
                  <li>Charge a reasonable fee if your request is excessive, repetitive, or unfounded</li>
                  <li>Refuse your request if it is not required by law or would adversely affect the rights of others</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  We will respond to your request in accordance with applicable law. If you are not satisfied with our response, 
                  you may have the right to lodge a complaint with a data protection authority in your jurisdiction.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed mb-3">
                The Service is not intended for, designed for, or directed to individuals under the age of 18 (or the age of 
                majority in your jurisdiction, whichever is greater). We do not knowingly collect, use, or disclose personal 
                information from children without parental consent.
              </p>
              <p className="text-gray-300 leading-relaxed mb-3">
                <strong>Age Verification:</strong> By using the Service, you represent and warrant that you are at least 18 years 
                of age or the age of majority in your jurisdiction, whichever is greater, and have the legal capacity to enter into 
                agreements and consent to data processing.
              </p>
              <p className="text-gray-300 leading-relaxed mb-3">
                <strong>Parental Consent:</strong> If you are a parent or guardian and believe that your child under the age of 18 
                has provided us with personal information without your consent, please contact us immediately through the Service or 
                our support channels. We will take steps to verify the child's age, obtain parental consent if required, or delete 
                the child's information as appropriate.
              </p>
              <p className="text-gray-300 leading-relaxed mb-3">
                <strong>Discovery of Child Information:</strong> If we become aware that we have collected personal information 
                from a child under the age of 18 without parental consent, we will take immediate steps to delete that information 
                from our systems, except where we are required to retain it by law or to protect the child's safety.
              </p>
              <p className="text-gray-300 leading-relaxed">
                <strong>Compliance:</strong> We comply with applicable laws regarding children's privacy, including the Children's 
                Online Privacy Protection Act (COPPA) in the United States and similar laws in other jurisdictions, to the extent 
                applicable to our Service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking Technologies</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3">9.1 What Are Cookies and Tracking Technologies</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We use cookies, local storage, web beacons, pixel tags, and similar tracking technologies ("Cookies" or 
                  "Tracking Technologies") to collect information about your device, usage, and interactions with the Service. 
                  Cookies are small text files that are stored on your device when you visit a website. They allow websites to 
                  remember your preferences, authenticate your identity, and track your activity.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">9.2 Types of Cookies We Use</h3>
                <p className="text-gray-300 leading-relaxed mb-3">We use various types of Cookies for different purposes:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li><strong>Essential Cookies:</strong> Required for the Service to function properly, such as authentication 
                  cookies that maintain your login session and security cookies that protect against fraud</li>
                  <li><strong>Preference Cookies:</strong> Remember your preferences, settings, and choices to personalize your 
                  experience, such as language preferences or analysis settings</li>
                  <li><strong>Analytics Cookies:</strong> Collect information about how you use the Service, such as pages visited, 
                  features used, and actions taken, to understand usage patterns and improve the Service</li>
                  <li><strong>Performance Cookies:</strong> Monitor Service performance, such as page load times, response times, 
                  and error rates, to optimize performance and ensure reliability</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">9.3 How We Use Cookies</h3>
                <p className="text-gray-300 leading-relaxed mb-3">We use Cookies to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>Authenticate your identity and maintain your login session</li>
                  <li>Remember your preferences, settings, and choices</li>
                  <li>Track usage patterns, analyze Service performance, and improve functionality</li>
                  <li>Protect against fraud, abuse, and unauthorized access</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Ensure security and prevent security threats</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">9.4 Third-Party Cookies</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We may allow third parties to set Cookies on the Service for analytics, advertising, or other purposes. These 
                  third-party Cookies are subject to the privacy policies and terms of those third parties, not this Privacy Policy.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">9.5 Managing Cookies</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  You can control and manage Cookies through your browser settings. Most browsers allow you to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>View and delete Cookies stored on your device</li>
                  <li>Block or refuse all Cookies or specific types of Cookies</li>
                  <li>Set your browser to notify you when a Cookie is being set</li>
                  <li>Set your browser to automatically delete Cookies when you close your browser</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mb-3">
                  However, blocking or disabling certain Cookies may affect your ability to use the Service or certain features. 
                  Essential Cookies are required for the Service to function, and disabling them may prevent you from accessing or 
                  using the Service.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Instructions for managing Cookies vary by browser. Please refer to your browser's help documentation for 
                  instructions on how to manage Cookies.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3">10.1 Cross-Border Data Transfers</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Your personal information may be transferred to, stored in, and processed in countries other than your country 
                  of residence. These countries may have data protection laws that differ from those in your country, including 
                  laws that may provide less protection for your personal information.
                </p>
                <p className="text-gray-300 leading-relaxed mb-3">
                  By using the Service, you acknowledge and consent to the transfer of your information to these countries, 
                  including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>Transfer to Google's servers located in various countries for AI processing and analysis (see Section 4.2)</li>
                  <li>Transfer to Paystack's servers located in various countries for payment processing and subscription 
                  management (see Section 4.1)</li>
                  <li>Transfer to third-party hosting and cloud infrastructure providers located in various countries for data 
                  storage and processing</li>
                  <li>Transfer to other third-party service providers located in various countries as necessary to provide the 
                  Service</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">10.2 Safeguards for International Transfers</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  When we transfer your information internationally, we implement appropriate safeguards to protect your information, 
                  including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>Contractual clauses and agreements with third parties that require them to protect your information in 
                  accordance with applicable data protection laws</li>
                  <li>Standard contractual clauses approved by data protection authorities where applicable</li>
                  <li>Compliance with applicable data protection laws and regulations</li>
                  <li>Technical and organizational measures to protect your information regardless of where it is processed</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">10.3 Your Consent</h3>
                <p className="text-gray-300 leading-relaxed">
                  By using the Service and providing your information, you acknowledge and consent to the international transfer, 
                  storage, and processing of your information as described in this Privacy Policy. If you do not consent to 
                  international transfers, please do not use the Service. Your information may still be transferred to countries 
                  outside your jurisdiction as necessary to provide the Service, but we will take appropriate measures to protect 
                  your information.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3">11.1 Policy Updates</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We may update, modify, or revise this Privacy Policy from time to time to reflect changes in our practices, 
                  the Service, technology, legal requirements, industry standards, or for other reasons. We reserve the right to 
                  change this Privacy Policy at any time, with or without notice.
                </p>
                <p className="text-gray-300 leading-relaxed mb-3">
                  When we make changes to this Privacy Policy, we will:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>Update the "Last updated" date at the top of this Privacy Policy</li>
                  <li>Post the updated Privacy Policy on this page</li>
                  <li>Provide reasonable notice of material changes as described below</li>
                  <li>Obtain your consent if required by applicable law for material changes</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">11.2 Notice of Material Changes</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  For material changes to this Privacy Policy that significantly affect your rights or our data practices, we will 
                  provide reasonable notice, which may include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>Posting a prominent notice on the Service or through your account</li>
                  <li>Sending an email notification to the email address associated with your account</li>
                  <li>Providing at least 30 days notice before material changes take effect, when feasible</li>
                  <li>Obtaining your explicit consent if required by applicable law</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mb-3">
                  <strong>What constitutes a material change:</strong> Material changes include, but are not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>Changes to the types of information we collect or how we collect it</li>
                  <li>Changes to how we use or process your information</li>
                  <li>Changes to how we share or disclose your information</li>
                  <li>Changes to your privacy rights or how to exercise them</li>
                  <li>Changes to our security measures or data retention practices</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">11.3 Effective Date of Changes</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Changes to this Privacy Policy are effective when they are posted on this page, unless otherwise specified or 
                  required by applicable law. Material changes may have a delayed effective date as described in Section 11.2.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">11.4 Your Continued Use</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Your continued use of the Service after changes to this Privacy Policy constitutes your acceptance of the updated 
                  Privacy Policy. If you do not agree with the updated Privacy Policy, you must stop using the Service and may 
                  delete your account.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  We encourage you to review this Privacy Policy periodically to stay informed about how we collect, use, and 
                  protect your information. The date of the last update is indicated at the top of this Privacy Policy.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us through the Service 
                  or at our support channels. For questions specifically about:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-300">
                  <li><strong>Paystack payments:</strong> Please visit Paystack's website (paystack.com) and review their Privacy 
                  Policy and Terms of Service to understand their data collection and processing practices. You may also contact 
                  Paystack directly through their website for payment-related privacy questions.</li>
                  <li><strong>Google AI processing:</strong> Please visit Google's websites (including ai.google.dev and 
                  policies.google.com) and review their AI Terms of Service and Privacy Policy to understand their data collection 
                  and processing practices. You may also contact Google directly through their support channels for AI-related 
                  privacy questions.</li>
                </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <IconArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

