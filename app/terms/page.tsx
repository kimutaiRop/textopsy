import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowLeft, IconLogo } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms and Conditions for Textopsy - Message Autopsy Analysis Service",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
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
            <h1 className="text-3xl font-bold">Terms and Conditions</h1>
          </div>
          <p className="text-gray-400 text-sm mb-2">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-gray-500 text-xs">Textopsy is a product of Velinex. Service available at https://textopsy.velinexlabs.com/</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              These Terms and Conditions ("Terms", "Terms of Service", "Agreement") constitute a legally binding agreement between you 
              ("User", "you", "your") and Textopsy ("Company", "we", "us", "our", "Service Provider"), a product of Velinex, governing 
              your access to and use of the Textopsy website accessible at https://textopsy.velinexlabs.com/, application, and all related 
              services (collectively, "the Service", "Service", "Platform").
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              By accessing, browsing, registering for, creating an account with, or otherwise using the Service in any manner whatsoever, 
              you acknowledge that you have read, understood, and agree to be bound by these Terms and all applicable laws and regulations. 
              If you do not agree with any part of these Terms, you must not access or use the Service.
            </p>
            <p className="text-gray-300 leading-relaxed">
              These Terms apply to all visitors, users, subscribers, and all other persons who access or use the Service ("Users"). 
              By using the Service, you represent and warrant that you are at least 18 years of age or the age of majority in your 
              jurisdiction, whichever is greater, and have the legal capacity to enter into this Agreement. If you are using the Service 
              on behalf of a company, organization, or other legal entity, you represent and warrant that you have authority to bind 
              that entity to these Terms, in which case "you" and "your" will refer to that entity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
            <p className="text-gray-300 leading-relaxed mb-4">For the purposes of these Terms, the following definitions apply. These definitions are intended to be comprehensive and unambiguous:</p>
            <ul className="list-disc pl-6 space-y-3 text-gray-300">
              <li><strong>"Service" or "Platform"</strong> means the Textopsy website located at https://textopsy.velinexlabs.com/ (a product of Velinex), 
              web application, mobile application (if any), application programming interfaces (APIs), backend systems, databases, servers, 
              and all related services, features, content, functionality, software, tools, and technology offered, provided, or made available 
              by Textopsy, including but not limited to message analysis, conversation analysis, AI-powered insights, persona-driven analysis, 
              subscription services, billing services, user accounts, and any related documentation or materials.</li>
              <li><strong>"User", "you", "your", "End User"</strong> means any individual, person, company, organization, entity, or 
              representative thereof that accesses, uses, registers for, subscribes to, creates an account with, or otherwise interacts with 
              the Service in any manner, including but not limited to free users, premium subscribers, trial users, visitors, guests, and 
              any person accessing the Service through a User's account, whether authorized or unauthorized.</li>
              <li><strong>"Content" or "User Content"</strong> means any and all data, information, text, messages, conversations, images, 
              photographs, screenshots, graphics, videos, audio files, files, documents, links, metadata, or other material of any kind 
              whatsoever, in any format, that you submit, upload, post, transmit, provide, input, paste, share, or otherwise make available 
              to, through, or in connection with the Service, whether publicly or privately.</li>
              <li><strong>"Account" or "User Account"</strong> means the user account you create, register for, or maintain to access and 
              use the Service, including all associated information, credentials (username, email, password), preferences, settings, 
              subscription details, billing information, usage history, analysis results, and any other data stored in connection with 
              your account.</li>
              <li><strong>"Subscription" or "Premium Subscription"</strong> means a paid subscription plan, whether monthly, annual, or 
              any other billing cycle, that provides access to premium features, services, functionality, increased limits, or other 
              enhanced services beyond the free tier of the Service.</li>
              <li><strong>"Free Tier" or "Free Plan"</strong> means the free version of the Service that provides limited access to 
              features and services subject to usage restrictions, limits, quotas, or other constraints as described in the Service.</li>
              <li><strong>"Billing Cycle" or "Subscription Period"</strong> means the recurring period for which you are charged subscription 
              fees, which may be monthly (approximately 30 days), annually (approximately 365 days), or another period as explicitly specified 
              in your subscription plan selection, commencing from the date of purchase or renewal.</li>
              <li><strong>"Third-Party Services" or "Third-Party Providers"</strong> means external services, platforms, providers, vendors, 
              contractors, or entities that are not owned, controlled, or operated by Textopsy, including but not limited to payment processors 
              (Paystack), AI service providers (Google Gemini AI/Google AI), hosting services, cloud services, database services, email 
              services, analytics providers, and any other third-party services integrated with or used by the Service.</li>
              <li><strong>"Paystack"</strong> means Paystack Payments Limited and its affiliates, subsidiaries, successors, and assigns, 
              which provides payment processing services as a third-party payment processor for the Service.</li>
              <li><strong>"Google Gemini AI" or "Google AI"</strong> means Google LLC and its affiliates, subsidiaries, successors, and 
              assigns, which provides artificial intelligence and machine learning services through its Gemini AI platform as a third-party 
              AI service provider for the Service.</li>
              <li><strong>"Intellectual Property" or "IP"</strong> means all intellectual property rights, proprietary rights, and 
              intangible property rights of any kind, including but not limited to copyrights (including moral rights), trademarks, 
              service marks, trade names, trade dress, logos, designs, patents, trade secrets, know-how, proprietary information, 
              database rights, rights of publicity, rights of privacy, and any other similar rights recognized in any jurisdiction 
              throughout the world, whether registered or unregistered, and including all applications, registrations, renewals, 
              extensions, and continuations thereof.</li>
              <li><strong>"Analysis Results" or "Results"</strong> means any output, insights, analysis, feedback, reports, 
              recommendations, diagnoses, scores, assessments, or other information generated by or derived from the Service's analysis 
              of your Content, including but not limited to AI-generated text, ratings, scores, and interpretations.</li>
              <li><strong>"Prohibited Content"</strong> means any Content that is illegal, harmful, threatening, abusive, harassing, 
              defamatory, libelous, vulgar, obscene, pornographic, invasive of privacy or publicity rights, hateful, racially or 
              ethnically offensive, or otherwise objectionable, or that violates any applicable law, regulation, or third-party rights.</li>
              <li><strong>"Breach" or "Material Breach"</strong> means any violation, non-compliance, or failure to observe or perform 
              any term, condition, obligation, or requirement set forth in these Terms or any applicable law or regulation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Description of Service</h2>
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                Textopsy is an artificial intelligence-powered message analysis and conversation analysis service that provides insights, 
                analysis, and personalized feedback regarding text conversations, message threads, and communication patterns. The Service 
                uses third-party artificial intelligence and machine learning technology, specifically Google Gemini AI, to analyze 
                conversations and generate personalized feedback, insights, interpretations, and assessments based on user-submitted content.
              </p>
              <p className="text-gray-300 leading-relaxed">
                The Service offers multiple analysis personas and perspectives, allowing Users to receive insights tailored to different 
                communication styles and relationship contexts. The Service may include features such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>Text conversation analysis and message thread interpretation</li>
                <li>Screenshot-based conversation analysis from messaging applications</li>
                <li>AI-powered insights and personality-driven feedback</li>
                <li>Multiple analysis personas (e.g., Brutal Bestie, Diplomatic Advisor, etc.)</li>
                <li>Conversation context clarification and follow-up questions</li>
                <li>Analysis history and saved conversations</li>
                <li>Free and premium subscription tiers with different usage limits and features</li>
              </ul>
              <p className="text-gray-300 leading-relaxed">
                <strong>Important:</strong> The Service is provided for entertainment and informational purposes only. The analysis, 
                insights, and feedback provided by the Service are generated by artificial intelligence and are not professional advice, 
                legal advice, medical advice, psychological counseling, relationship counseling, or any form of professional consultation. 
                The Service should not be used as a substitute for professional advice, counseling, or consultation. AI-generated content 
                may contain errors, inaccuracies, biases, or inappropriate responses and should not be relied upon for making important 
                personal, legal, financial, medical, or relationship decisions.
              </p>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right, in our sole discretion, to modify, suspend, discontinue, or terminate any aspect of the Service 
                at any time, including but not limited to features, functionality, availability, access, pricing, and limits, with or 
                without notice to Users. We may also impose usage limits, quotas, or restrictions on free or paid tiers of the Service 
                at any time.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              The Service relies on, integrates with, and uses various Third-Party Services to provide functionality, process payments, 
              perform AI analysis, and enhance the Service. Your use of the Service may involve interaction with these Third-Party Services, 
              and you acknowledge and agree that your use of Third-Party Services is subject to the terms, conditions, policies, and 
              practices of those third parties, not Textopsy.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              <strong>We are not responsible for, and do not endorse, control, or guarantee the availability, accuracy, reliability, 
              security, or privacy of any Third-Party Services.</strong> We disclaim all liability for any loss, damage, or harm arising 
              from or related to your use of or interaction with Third-Party Services, including but not limited to payment processing 
              issues, AI service interruptions, data breaches, or privacy violations by third parties.
            </p>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">4.1 Payment Processing - Paystack</h3>
                <div className="space-y-3">
                  <p className="text-gray-300 leading-relaxed">
                    We use <strong>Paystack Payments Limited ("Paystack")</strong> as our exclusive third-party payment processor for 
                    handling all subscription payments, recurring billing, transaction processing, and payment-related functionality. 
                    Paystack is a Stripe company that provides payment processing services in compliance with applicable financial 
                    regulations and payment card industry standards.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>Payment Processing:</strong> When you subscribe to a premium plan or make any payment through the Service, 
                    you will be redirected to Paystack's secure payment gateway or payment page. All payment transactions are processed 
                    directly by Paystack, not by Textopsy. By making a payment or subscribing to the Service, you acknowledge and agree 
                    that you are entering into a direct relationship with Paystack for payment processing services.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>Paystack Terms and Policies:</strong> By using our Service and making payments through Paystack, you 
                    expressly agree to be bound by Paystack's Terms of Service, Privacy Policy, and all other applicable policies, 
                    terms, and conditions. You are responsible for reviewing and understanding Paystack's terms, privacy policy, and 
                    data collection practices before making any payment. We strongly encourage you to visit Paystack's website 
                    (paystack.com) to review their Terms of Service and Privacy Policy to understand what data they collect, how they 
                    use it, and how they protect it. We are not responsible for Paystack's terms, policies, or data practices.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>Payment Information Security:</strong> Textopsy does not store, retain, or have access to your full payment 
                    card details, including credit card numbers, debit card numbers, CVV codes, expiration dates, or other sensitive 
                    payment information. All payment information, including credit card details, is collected, processed, transmitted, 
                    and stored securely by Paystack in accordance with Paystack's security practices and applicable payment card industry 
                    data security standards (PCI DSS). We only receive transaction confirmations, transaction IDs, payment status, and 
                    limited payment metadata from Paystack necessary to manage your subscription and provide the Service.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>Payment Authorization:</strong> By providing payment information through Paystack, you authorize Paystack 
                    and Textopsy to charge your payment method for the subscription fees and any applicable taxes, fees, or charges 
                    associated with your subscription. You authorize recurring charges for subscription renewals until you cancel your 
                    subscription. You are responsible for ensuring that your payment method has sufficient funds and remains valid and 
                    active throughout your subscription period.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>Payment Disputes and Chargebacks:</strong> Any disputes regarding payment processing, unauthorized charges, 
                    refunds, or billing issues must be directed to Paystack in accordance with Paystack's dispute resolution procedures. 
                    We are not responsible for resolving payment disputes or chargebacks initiated through Paystack or your payment 
                    provider. If you initiate a chargeback or payment dispute, we reserve the right to immediately suspend or terminate 
                    your account and subscription.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>Paystack Service Availability:</strong> We are not responsible for any errors, failures, delays, 
                    interruptions, or unavailability of Paystack's payment processing services. If Paystack experiences technical 
                    issues, service outages, or becomes unavailable, your ability to make payments or renew subscriptions may be 
                    affected, and we are not liable for any resulting consequences.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>Paystack Data Processing:</strong> Paystack may collect, process, store, and share your payment information 
                    and related data in accordance with Paystack's Privacy Policy and applicable laws. We are not responsible for how 
                    Paystack handles your payment data. You acknowledge that payment information you provide to Paystack may be subject 
                    to Paystack's data retention policies and may be processed in jurisdictions outside your country of residence.
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">4.2 AI Services - Google Gemini AI</h3>
                <div className="space-y-3">
                  <p className="text-gray-300 leading-relaxed">
                    Our message analysis, conversation analysis, and AI-powered insights are powered by <strong>Google Gemini AI 
                    ("Google AI")</strong>, provided by Google LLC. All AI analysis, content generation, insights, recommendations, 
                    and feedback provided through the Service are processed, generated, and delivered using Google's Gemini AI platform 
                    and infrastructure, which is operated and maintained by Google, not Textopsy.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>Google AI Terms and Policies:</strong> Your use of the AI analysis features of the Service involves 
                    interaction with Google AI services, and you acknowledge and agree that your Content submitted for analysis will be 
                    processed by Google AI. By using the Service, you agree to comply with Google's Gemini API Terms of Service, 
                    Google's Terms of Service, Google's Privacy Policy, and all other applicable Google policies. We strongly encourage 
                    you to visit Google's websites (including ai.google.dev and policies.google.com) to review their Terms of Service, 
                    Privacy Policy, and AI policies to understand what data they collect, how they use it, how they process your 
                    Content, and how they protect it. We are not responsible for Google's terms, policies, or data practices.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>Content Processing by Google:</strong> When you submit Content for analysis, your Content is transmitted to 
                    Google's servers and processed by Google's AI infrastructure. Google may use your Content to perform AI analysis, 
                    generate insights, and provide results. Your Content may be processed in jurisdictions outside your country of 
                    residence. Google's use of your Content is subject to Google's data processing practices, privacy policies, and 
                    terms of service.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>AI Accuracy and Limitations:</strong> While we make reasonable efforts to ensure quality and accuracy, 
                    the AI-generated insights, analysis, feedback, recommendations, and results are provided "as is" and "as available" 
                    without any warranties or guarantees of accuracy, reliability, completeness, usefulness, or appropriateness. 
                    AI-generated content may contain errors, inaccuracies, biases, hallucinations, inappropriate responses, or 
                    incomplete information. AI analysis may not always be accurate, reliable, or appropriate for your specific 
                    situation, context, or needs.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>Not Professional Advice:</strong> AI-generated insights, analysis, and feedback are not professional advice, 
                    legal advice, medical advice, psychological counseling, relationship counseling, financial advice, or any form of 
                    professional consultation. The AI analysis should not be relied upon for making important personal, legal, medical, 
                    financial, or relationship decisions. Always consult qualified professionals for advice on important matters.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>Google AI Service Availability:</strong> We are not responsible for any errors, failures, delays, 
                    interruptions, or unavailability of Google AI services. If Google AI experiences technical issues, service outages, 
                    rate limits, API changes, service discontinuation, or becomes unavailable, your ability to use AI analysis features 
                    may be affected, and we are not liable for any resulting consequences. Google may modify, suspend, or discontinue 
                    its AI services at any time without notice.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>Google AI Policy Changes:</strong> Google may modify its AI services, terms, policies, pricing, or 
                    functionality at any time. Such changes may affect the Service's AI features, quality, availability, or functionality. 
                    We are not responsible for adapting to or compensating for changes in Google's services, and we reserve the right 
                    to modify, suspend, or discontinue AI features if Google's services change in a manner that affects our ability to 
                    provide those features.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    <strong>Third-Party Liability:</strong> We disclaim all liability for any loss, damage, harm, or consequences 
                    arising from or related to Google AI's processing of your Content, AI-generated results, errors in AI analysis, 
                    inappropriate AI responses, or any issues with Google's AI services. Your sole recourse for issues with Google AI 
                    is with Google, not Textopsy.
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">4.3 Other Third-Party Services</h3>
                <p className="text-gray-300 leading-relaxed">
                  The Service may use other third-party services for hosting, cloud infrastructure, databases, email delivery, analytics, 
                  security, monitoring, and other functions. Your use of the Service may involve interaction with these services. 
                  We are not responsible for the availability, accuracy, reliability, security, or privacy of these third-party services, 
                  and we disclaim all liability for any issues arising from or related to such services.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. User Accounts and Registration</h2>
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                To access and use certain features of the Service, including premium subscriptions, analysis history, and saved 
                conversations, you must register for and create a User Account. Registration requires providing certain information 
                and creating login credentials (email address and password).
              </p>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">5.1 Account Registration Requirements</h3>
                <p className="text-gray-300 leading-relaxed mb-3">When registering for an Account, you agree to and warrant that:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>You will provide accurate, current, complete, truthful, and verifiable information during registration and 
                  whenever you update your Account information</li>
                  <li>All information you provide is your own information or information you are authorized to provide</li>
                  <li>You will maintain and promptly update your Account information to ensure it remains accurate, current, 
                  complete, and truthful</li>
                  <li>You will not provide false, misleading, fraudulent, or inaccurate information</li>
                  <li>You will not impersonate, misrepresent, or falsely claim to be any person, entity, or organization</li>
                  <li>You will not use another person's email address, identity, or credentials without authorization</li>
                  <li>You will not create multiple Accounts to circumvent usage limits, restrictions, or terms</li>
                  <li>You will not register for an Account if you have been previously banned, terminated, or prohibited from using the Service</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  We reserve the right, in our sole discretion, to refuse, reject, suspend, or terminate any Account registration 
                  or Account at any time, for any reason, including but not limited to suspected fraud, violation of these Terms, 
                  or providing false or misleading information.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">5.2 Account Security and Password Protection</h3>
                <p className="text-gray-300 leading-relaxed mb-3">You are solely responsible for maintaining the security, confidentiality, and integrity of your Account credentials, including:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>Maintaining the security and confidentiality of your password and authentication credentials</li>
                  <li>Using a strong, unique password that is not easily guessable and not used for other accounts</li>
                  <li>Not sharing, disclosing, or revealing your password, login credentials, or Account access to any third party</li>
                  <li>Not allowing any other person to access or use your Account</li>
                  <li>Logging out of your Account when using shared or public devices or networks</li>
                  <li>Notifying us immediately if you become aware of or suspect any unauthorized access, use, or breach of 
                  your Account security</li>
                  <li>Taking all reasonable precautions to prevent unauthorized access to your Account</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  <strong>You are solely responsible for all activities, actions, transactions, and use that occur under your 
                  Account, whether authorized or unauthorized.</strong> We are not responsible for any loss, damage, or harm 
                  arising from unauthorized access to or use of your Account, and you agree to indemnify and hold us harmless 
                  from any claims, damages, or liabilities arising from unauthorized use of your Account.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">5.3 Account Ownership and Transfer</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Your Account is personal to you and may not be transferred, assigned, sold, rented, leased, or otherwise 
                  transferred to any third party without our express written consent. You may not share, lend, or allow any 
                  other person to use your Account. Each Account is intended for use by a single individual or entity.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  If you are using the Service on behalf of a company, organization, or other entity, the Account remains 
                  the property of Textopsy, and you may not transfer or assign the Account without our consent. Upon termination 
                  of your relationship with the entity on whose behalf you are using the Service, you must notify us, and we 
                  may require the entity to designate a new authorized user or may terminate the Account.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">5.4 Account Suspension and Termination by Us</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We reserve the right, in our sole discretion and without liability, to suspend, limit, restrict, or terminate 
                  your Account and access to the Service at any time, for any reason, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>Violation of these Terms or any applicable law or regulation</li>
                  <li>Fraudulent, illegal, or unauthorized use of the Service</li>
                  <li>Providing false, misleading, or inaccurate information</li>
                  <li>Breach of security, unauthorized access, or suspected account compromise</li>
                  <li>Non-payment of subscription fees or chargeback disputes</li>
                  <li>Use of the Service in a manner that violates third-party rights</li>
                  <li>Any conduct that we determine, in our sole discretion, is harmful to us, other Users, or third parties</li>
                  <li>Extended periods of inactivity</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  We may suspend or terminate your Account immediately without prior notice if we reasonably believe that immediate 
                  action is necessary to protect the Service, other Users, or third parties from harm, fraud, or illegal activity.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">5.5 Account Cancellation by You</h3>
                <p className="text-gray-300 leading-relaxed">
                  You may cancel or delete your Account at any time by contacting us through the Service or our support channels. 
                  Upon cancellation, your Account will be deactivated, and you will lose access to your Account, analysis history, 
                  saved conversations, and all associated data. We may retain certain information as required by law or as described 
                  in our Privacy Policy. Subscription fees are non-refundable, and cancellation does not entitle you to a refund 
                  of any fees already paid.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Subscription Plans and Billing</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">6.1 Subscription Plans</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Textopsy offers both free and premium subscription plans. The free plan provides limited access to features and 
                  services subject to usage restrictions, limits, quotas, and constraints as described in the Service. Premium 
                  subscription plans provide enhanced access to features, increased limits, priority support, and additional services 
                  beyond the free tier.
                </p>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We reserve the right, in our sole discretion, to modify, change, update, add, remove, or discontinue subscription 
                  plans, features, functionality, pricing, limits, quotas, or any aspect of the Service at any time, with or without 
                  notice. Changes to subscription plans, pricing, or features may affect existing subscriptions, and we will provide 
                  reasonable notice of material changes when feasible.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  <strong>Free Plan Limitations:</strong> Free plans have usage limits, quotas, and restrictions that may include 
                  but are not limited to: limited number of analyses per period, limited access to certain features, limited analysis 
                  history retention, and other constraints as described in the Service. We may modify free plan limitations at any 
                  time without notice.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">6.2 Subscription Pricing and Fees</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Premium subscription fees are displayed in the Service at the time of purchase and are charged in the currency 
                  specified (e.g., USD, NGN, or other supported currencies). Subscription fees may vary based on the subscription 
                  plan, billing cycle (monthly or annual), currency, location, and other factors. All prices are exclusive of any 
                  applicable taxes, fees, duties, or charges, which are your responsibility to pay.
                </p>
                <p className="text-gray-300 leading-relaxed mb-3">
                  <strong>Pricing Changes:</strong> We reserve the right to modify subscription pricing at any time. Price changes 
                  will not affect your current billing cycle, but will apply to renewals and new subscriptions. If we increase 
                  pricing for your subscription plan, we will provide at least 30 days notice before the price increase takes effect, 
                  and you will have the opportunity to cancel your subscription before the renewal date to avoid the price increase.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  <strong>Taxes and Fees:</strong> You are responsible for paying all applicable taxes, fees, duties, charges, 
                  or other amounts imposed by any governmental authority, including but not limited to sales tax, value-added tax 
                  (VAT), goods and services tax (GST), and any other taxes or fees applicable to your subscription. Tax rates and 
                  applicability may vary based on your location and applicable tax laws.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">6.3 Billing Cycle and Automatic Renewal</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Premium subscriptions are billed on a recurring basis according to the billing cycle you select (monthly or annual). 
                  Your subscription will automatically renew at the end of each billing cycle unless you cancel your subscription 
                  before the renewal date.
                </p>
                <p className="text-gray-300 leading-relaxed mb-3">
                  <strong>Automatic Renewal:</strong> By subscribing to a premium plan, you authorize us and our payment processor 
                  (Paystack) to automatically charge your payment method for the subscription fee and applicable taxes on a recurring 
                  basis at the beginning of each billing cycle. Automatic renewal will continue until you cancel your subscription.
                </p>
                <p className="text-gray-300 leading-relaxed mb-3">
                  <strong>Renewal Date:</strong> Subscription renewals occur on the same calendar date as your initial subscription 
                  date (or the nearest date if that date does not exist in a given month, such as February 29). For example, if your 
                  subscription starts on January 15, it will renew on the 15th of each subsequent month (for monthly subscriptions) 
                  or January 15 of each subsequent year (for annual subscriptions).
                </p>
                <p className="text-gray-300 leading-relaxed mb-3">
                  <strong>Payment Method:</strong> You are responsible for ensuring that your payment method (credit card, debit card, 
                  bank account, or other payment method) remains valid, active, and has sufficient funds or credit available for 
                  subscription renewals. If a payment fails, your subscription may be suspended or terminated, and you may lose 
                  access to premium features.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  <strong>No Refund for Partial Periods:</strong> Subscription fees are charged in advance for the entire billing 
                  cycle. If you cancel your subscription mid-cycle, you will continue to have access to premium features until the 
                  end of your current billing period, but you will not receive a refund or credit for any unused portion of the 
                  billing period.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">6.4 Subscription Cancellation</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  You may cancel your subscription at any time through your Account settings or by contacting us through the Service 
                  or our support channels. Cancellation must be completed before your next renewal date to prevent automatic renewal 
                  and charging for the next billing cycle.
                </p>
                <p className="text-gray-300 leading-relaxed mb-3">
                  <strong>Cancellation Effective Date:</strong> Upon cancellation, your subscription will remain active until the 
                  end of your current billing period, and you will continue to have access to premium features until that time. 
                  After the end of your billing period, your subscription will not renew, and you will be downgraded to the free plan.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  <strong>No Refund upon Cancellation:</strong> Cancellation of your subscription does not entitle you to a refund 
                  of any fees already paid, including fees paid for the current billing cycle. Subscription fees are non-refundable 
                  except as required by law or as explicitly stated in our refund policy below.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">6.5 Refund Policy</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  <strong>General Refund Policy:</strong> All subscription fees are non-refundable except as required by applicable 
                  law or as explicitly provided in these Terms. We do not provide refunds or credits for subscription fees paid, 
                  regardless of whether you have used the Service or not, unless required by law or as set forth below.
                </p>
                <p className="text-gray-300 leading-relaxed mb-3">
                  <strong>Limited Refund Exceptions:</strong> We may, in our sole discretion and on a case-by-case basis, provide 
                  refunds or credits in the following limited circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>If required by applicable consumer protection laws or regulations</li>
                  <li>If we are unable to provide the Service due to a material error on our part</li>
                  <li>If you cancel your subscription within a legally required cooling-off period (if applicable in your jurisdiction)</li>
                  <li>If we terminate your subscription without cause and you have not violated these Terms</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  <strong>No Refunds for:</strong> We do not provide refunds for (i) change of mind or dissatisfaction with the Service, 
                  (ii) inability to use the Service due to your technical issues, device problems, or internet connectivity, 
                  (iii) cancellation after the billing cycle has started, (iv) unused subscription time or credits, (v) accidental 
                  purchases (you are responsible for reviewing your purchase before confirming), or (vi) any other reason not 
                  explicitly stated above.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">6.6 Payment Failures and Failed Charges</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  If a payment for your subscription renewal fails (e.g., due to insufficient funds, expired card, declined payment, 
                  or other payment processing issues), we may attempt to retry the payment. If payment continues to fail, we may 
                  suspend or terminate your subscription, and you may lose access to premium features.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  You are responsible for updating your payment method if it expires, becomes invalid, or is otherwise unable to 
                  process payments. If your payment fails, we may contact you to update your payment method. Failure to update 
                  your payment method may result in subscription suspension or termination.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">6.7 Chargebacks and Payment Disputes</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  If you dispute a charge or initiate a chargeback with your payment provider or bank, we reserve the right to 
                  immediately suspend or terminate your Account and subscription until the dispute is resolved. Chargeback disputes 
                  should be directed to our support team first, as we may be able to resolve the issue without a chargeback.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  If you initiate a chargeback, you agree to reimburse us for any chargeback fees, penalties, or costs we incur 
                  as a result of the chargeback. We may also suspend or permanently ban your Account and refuse to provide Service 
                  to you in the future if you initiate chargebacks without good faith basis or in violation of these Terms.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">6.8 Upgrading and Downgrading Subscriptions</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  You may upgrade or downgrade your subscription plan at any time through your Account settings. Upgrades will take 
                  effect immediately, and you will be charged the prorated difference for the remainder of your current billing cycle. 
                  Downgrades will take effect at the beginning of your next billing cycle, and you will continue to have access to 
                  premium features until then.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  If you downgrade your subscription, you may lose access to certain premium features, increased limits, or other 
                  benefits associated with the higher-tier plan. We are not responsible for any loss of data, features, or functionality 
                  resulting from subscription downgrades.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. User Content and Privacy</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">7.1 Content Ownership and License</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  You retain all ownership rights, title, and interest in and to your Content. By submitting, uploading, posting, 
                  transmitting, or otherwise making available any Content to or through the Service, you grant Textopsy a worldwide, 
                  non-exclusive, royalty-free, perpetual, irrevocable, sublicensable, transferable license to use, reproduce, modify, 
                  adapt, translate, distribute, publish, display, perform, and otherwise exploit your Content solely for the purpose 
                  of providing, operating, maintaining, and improving the Service.
                </p>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Specifically, you grant us the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>Process, analyze, and transmit your Content to third-party AI services (including Google Gemini AI) for the 
                  purpose of generating analysis and insights</li>
                  <li>Store, archive, and retain your Content on our servers or third-party hosting services as necessary to 
                  provide the Service, maintain analysis history, and improve the Service</li>
                  <li>Generate, store, and associate Analysis Results with your Account</li>
                  <li>Use aggregated, anonymized, or de-identified Content for analytics, research, service improvement, or 
                  machine learning purposes</li>
                  <li>Back up, replicate, and maintain copies of your Content for disaster recovery and service continuity</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  This license continues even after you stop using the Service or delete your Account, to the extent necessary for 
                  us to fulfill our obligations, comply with legal requirements, or as otherwise described in our Privacy Policy.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">7.2 Content Responsibility and Warranties</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  You are solely responsible for your Content and warrant that:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>You own all rights, title, and interest in your Content, or you have obtained all necessary rights, 
                  licenses, consents, and permissions to submit, use, and grant the license described above</li>
                  <li>Your Content does not violate, infringe, or misappropriate any intellectual property rights, privacy rights, 
                  publicity rights, or other rights of any third party</li>
                  <li>Your Content does not violate any applicable laws, regulations, or third-party agreements</li>
                  <li>Your Content is accurate, truthful, and not misleading</li>
                  <li>You have obtained consent from all individuals whose personal information, messages, or content appear in 
                  your Content, if required by applicable law</li>
                  <li>Your Content does not contain Prohibited Content as defined in these Terms</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  You agree to indemnify and hold Textopsy harmless from any claims, damages, losses, liabilities, costs, or expenses 
                  (including attorneys' fees) arising from or related to your Content or your breach of these warranties.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">7.3 Content Removal and Deletion</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We reserve the right, but not the obligation, to review, monitor, filter, modify, remove, or delete any Content 
                  at any time, for any reason, without notice, including but not limited to Content that violates these Terms, 
                  applicable laws, or third-party rights, or that we determine, in our sole discretion, is harmful, inappropriate, 
                  or objectionable.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  You may delete your Content through the Service, but deletion may not be immediate, and we may retain copies 
                  in backups, archives, or as required by law. Deletion of Content may result in the deletion of associated 
                  Analysis Results.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">7.4 Privacy and Data Protection</h3>
                <p className="text-gray-300 leading-relaxed">
                  We take your privacy seriously and are committed to protecting your personal information and Content in accordance 
                  with applicable data protection laws and our Privacy Policy. For detailed information about how we collect, use, 
                  store, share, and protect your information and Content, including our use of third-party services, please see our 
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline"> Privacy Policy</Link>, which is 
                  incorporated into these Terms by reference. By using the Service, you consent to our collection, use, and sharing 
                  of your information as described in our Privacy Policy.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Acceptable Use</h2>
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed mb-4">
                You agree to use the Service only for lawful purposes and in accordance with these Terms and all applicable laws, 
                regulations, and third-party rights. You agree not to use the Service in any manner that could damage, disable, 
                overburden, impair, or interfere with the Service or any other User's use of the Service.
              </p>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">8.1 Prohibited Activities</h3>
                <p className="text-gray-300 leading-relaxed mb-3">You agree NOT to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong>Submit Prohibited Content:</strong> Submit, upload, post, transmit, or otherwise make available any 
                  Content that is illegal, harmful, threatening, abusive, harassing, defamatory, libelous, vulgar, obscene, 
                  pornographic, invasive of privacy or publicity rights, hateful, racially or ethnically offensive, or otherwise 
                  objectionable</li>
                  <li><strong>Violate Laws or Rights:</strong> Use the Service in violation of any applicable laws, regulations, 
                  or third-party rights, including but not limited to intellectual property rights, privacy rights, publicity rights, 
                  or data protection laws</li>
                  <li><strong>Harmful or Malicious Activities:</strong> Use the Service to harm, harass, threaten, intimidate, 
                  stalk, or otherwise abuse any person or entity, or to engage in any activity that could harm or endanger others</li>
                  <li><strong>Fraudulent Activities:</strong> Use the Service for any fraudulent, deceptive, or illegal purpose, 
                  including but not limited to impersonation, identity theft, or financial fraud</li>
                  <li><strong>Reverse Engineering:</strong> Attempt to reverse engineer, decompile, disassemble, or otherwise 
                  derive the source code, algorithms, or underlying ideas of the Service, or attempt to extract, scrape, or mine 
                  data from the Service</li>
                  <li><strong>Security Violations:</strong> Attempt to gain unauthorized access to the Service, Accounts of other 
                  Users, servers, networks, or systems, or engage in any activity that could compromise the security, integrity, 
                  or availability of the Service</li>
                  <li><strong>Service Disruption:</strong> Use the Service in any manner that could damage, disable, overburden, 
                  impair, interfere with, or disrupt the Service, servers, networks, or systems, including but not limited to 
                  denial-of-service attacks, distributed denial-of-service attacks, or other malicious activities</li>
                  <li><strong>Automated Access:</strong> Use automated systems, scripts, bots, crawlers, scrapers, or other 
                  automated means to access, use, or interact with the Service without our express written authorization</li>
                  <li><strong>Account Sharing:</strong> Share, lend, transfer, or allow any other person to use your Account, 
                  credentials, or access to the Service</li>
                  <li><strong>Multiple Accounts:</strong> Create multiple Accounts to circumvent usage limits, restrictions, 
                  quotas, or terms, or to evade account suspension or termination</li>
                  <li><strong>Commercial Use:</strong> Use the Service for any commercial purpose, resale, or distribution without 
                  our express written authorization, or use the Service to compete with or harm our business</li>
                  <li><strong>Data Mining:</strong> Extract, scrape, mine, collect, or aggregate data from the Service, including 
                  but not limited to User data, Content, or Analysis Results, without our express written authorization</li>
                  <li><strong>Interfere with AI Services:</strong> Attempt to manipulate, interfere with, or exploit AI analysis, 
                  or submit Content designed to confuse, mislead, or corrupt AI analysis</li>
                  <li><strong>Circumvent Restrictions:</strong> Attempt to circumvent, bypass, or evade any usage limits, 
                  restrictions, quotas, security measures, or terms of service</li>
                  <li><strong>Violate Export Laws:</strong> Use the Service in violation of any export control laws, sanctions, 
                  or trade restrictions applicable to you or your jurisdiction</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">8.2 Enforcement of Acceptable Use</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We reserve the right, but not the obligation, to monitor, review, investigate, and take action regarding any 
                  suspected or actual violations of these Acceptable Use terms. We may, in our sole discretion and without liability, 
                  suspend, limit, restrict, or terminate your Account and access to the Service, remove or delete Content, or take 
                  any other action we deem appropriate in response to violations of these Terms.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  We may also report violations to law enforcement authorities, cooperate with investigations, and disclose 
                  information as necessary to protect our rights, Users, or third parties. You agree to cooperate with any 
                  investigation and waive any claims against us arising from our enforcement actions.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimers and Limitations of Liability</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">9.1 No Warranties</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  <strong>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR 
                  IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                  NON-INFRINGEMENT, ACCURACY, RELIABILITY, COMPLETENESS, TIMELINESS, OR AVAILABILITY.</strong>
                </p>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We do not warrant, guarantee, or represent that:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>The Service will be uninterrupted, secure, error-free, or available at all times</li>
                  <li>The Service will be free from viruses, malware, bugs, errors, defects, or security vulnerabilities</li>
                  <li>The results of any analysis will be accurate, reliable, complete, useful, or appropriate for your needs</li>
                  <li>Defects, errors, or problems will be corrected or remedied</li>
                  <li>The Service will meet your requirements, expectations, or needs</li>
                  <li>The Service will be compatible with your devices, browsers, or systems</li>
                  <li>Third-party services (including Paystack and Google AI) will be available, reliable, or error-free</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  Some jurisdictions do not allow the exclusion of implied warranties, so the above exclusion may not apply to you. 
                  However, to the fullest extent permitted by law, we disclaim all warranties, whether express or implied.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">9.2 AI Analysis Disclaimers</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  <strong>IMPORTANT:</strong> AI-generated insights, analysis, feedback, recommendations, and results are provided 
                  "AS IS" without any warranties or guarantees of accuracy, reliability, completeness, usefulness, or appropriateness. 
                  AI analysis may contain errors, inaccuracies, biases, hallucinations, incomplete information, or inappropriate responses. 
                  AI analysis may not always be accurate, reliable, or appropriate for your specific situation, context, or needs.
                </p>
                <p className="text-gray-300 leading-relaxed mb-3">
                  <strong>NOT PROFESSIONAL ADVICE:</strong> AI-generated insights, analysis, and feedback are NOT professional advice, 
                  legal advice, medical advice, psychological counseling, relationship counseling, financial advice, or any form of 
                  professional consultation. The Service is provided for entertainment and informational purposes only. You should not 
                  rely on AI analysis for making important personal, legal, medical, financial, or relationship decisions. Always 
                  consult qualified professionals for advice on important matters.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  We disclaim all liability for any loss, damage, or harm arising from or related to AI-generated analysis, insights, 
                  or recommendations, including but not limited to decisions made based on such analysis. Your use of AI analysis is 
                  at your own risk.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">9.3 Third-Party Service Disclaimers</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We disclaim all liability for any loss, damage, or harm arising from or related to Third-Party Services, including 
                  but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>Payment processing issues, failures, delays, or errors by Paystack or other payment processors</li>
                  <li>AI service interruptions, failures, errors, or unavailability by Google AI or other AI providers</li>
                  <li>Data breaches, security incidents, or privacy violations by third-party service providers</li>
                  <li>Changes, modifications, or discontinuation of third-party services</li>
                  <li>Third-party service terms, policies, or practices</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  We are not responsible for the availability, accuracy, reliability, security, or privacy of Third-Party Services. 
                  Your use of Third-Party Services is subject to the terms, conditions, and policies of those third parties, not Textopsy.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">9.4 Limitation of Liability</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  <strong>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL TEXTopsy, ITS AFFILIATES, SUBSIDIARIES, 
                  OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, REPRESENTATIVES, LICENSORS, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                  SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>Loss of profits, revenue, income, business, data, or goodwill</li>
                  <li>Loss of use, interruption of business, or loss of opportunities</li>
                  <li>Cost of procurement of substitute goods or services</li>
                  <li>Damages for personal injury, emotional distress, or pain and suffering</li>
                  <li>Damages arising from or related to your use or inability to use the Service</li>
                  <li>Damages arising from or related to AI analysis, insights, or recommendations</li>
                  <li>Damages arising from or related to Third-Party Services</li>
                  <li>Damages arising from or related to unauthorized access, use, or disclosure of your Content or information</li>
                  <li>Any other damages of any kind, whether based on contract, tort, strict liability, or other legal theory</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mb-3">
                  <strong>THE TOTAL AGGREGATE LIABILITY OF TEXTopsy, ITS AFFILIATES, AND SUPPLIERS FOR ALL CLAIMS ARISING FROM OR 
                  RELATED TO THE SERVICE OR THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS 
                  IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.</strong>
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages, so the above 
                  limitation may not apply to you. However, to the fullest extent permitted by law, our liability is limited as set 
                  forth above.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Intellectual Property</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">10.1 Our Intellectual Property</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  The Service, including but not limited to its design, text, graphics, logos, icons, images, audio, video, software, 
                  code, algorithms, features, functionality, user interface, content (except User Content), trademarks, service marks, 
                  trade names, and other intellectual property, is owned by Textopsy or its licensors and is protected by international 
                  copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
                <p className="text-gray-300 leading-relaxed mb-3">
                  You acknowledge that the Service contains proprietary and confidential information and that unauthorized use, 
                  reproduction, distribution, or disclosure may cause irreparable harm to Textopsy. All rights not expressly granted 
                  to you in these Terms are reserved by Textopsy and its licensors.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">10.2 Restrictions on Use</h3>
                <p className="text-gray-300 leading-relaxed mb-3">You agree NOT to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>Reproduce, copy, duplicate, or clone the Service or any part thereof</li>
                  <li>Distribute, publish, transmit, broadcast, or otherwise make available the Service or any part thereof to any 
                  third party</li>
                  <li>Modify, adapt, translate, create derivative works, reverse engineer, decompile, disassemble, or otherwise 
                  derive the source code, algorithms, or underlying ideas of the Service</li>
                  <li>Remove, alter, or obscure any copyright, trademark, patent, or other proprietary notices or labels on the Service</li>
                  <li>Use any trademark, service mark, trade name, or logo of Textopsy without our express written permission</li>
                  <li>Use the Service to create a competing service or to compete with Textopsy</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">10.3 User Feedback</h3>
                <p className="text-gray-300 leading-relaxed">
                  If you provide us with any feedback, suggestions, ideas, comments, or other input regarding the Service 
                  ("Feedback"), you grant us a worldwide, perpetual, irrevocable, royalty-free, sublicensable, transferable license 
                  to use, reproduce, modify, distribute, and otherwise exploit such Feedback for any purpose, without any 
                  compensation or obligation to you.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You agree to indemnify, defend, and hold harmless Textopsy, its affiliates, subsidiaries, officers, directors, 
              employees, agents, representatives, licensors, and suppliers from and against any and all claims, demands, actions, 
              suits, proceedings, investigations, liabilities, damages, losses, costs, expenses (including reasonable attorneys' 
              fees and costs), and judgments arising from or related to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
              <li>Your use or misuse of the Service</li>
              <li>Your Content or any content you submit, upload, or transmit through the Service</li>
              <li>Your violation of these Terms or any applicable law or regulation</li>
              <li>Your violation of any third-party rights, including but not limited to intellectual property rights, privacy 
              rights, or publicity rights</li>
              <li>Any unauthorized use of your Account, whether by you or a third party</li>
              <li>Any breach of your representations, warranties, or covenants in these Terms</li>
              <li>Any other conduct, activity, or omission by you in connection with the Service</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right, at our own expense, to assume the exclusive defense and control of any matter subject to 
              indemnification by you, in which case you agree to cooperate with our defense of such claims. You may not settle 
              any claim without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">12.1 Termination by You</h3>
                <p className="text-gray-300 leading-relaxed">
                  You may terminate your Account and stop using the Service at any time by canceling your subscription (if applicable) 
                  and deleting your Account through the Service or by contacting us. Termination of your Account will result in the 
                  immediate cessation of your access to the Service, except that you will continue to have access until the end of 
                  your current billing period if you have an active paid subscription.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">12.2 Termination by Us</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  We reserve the right, in our sole discretion and without liability, to suspend, limit, restrict, or terminate your 
                  Account and access to the Service at any time, for any reason, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>Violation of these Terms or any applicable law or regulation</li>
                  <li>Fraudulent, illegal, or unauthorized use of the Service</li>
                  <li>Non-payment of subscription fees or chargeback disputes</li>
                  <li>Extended periods of inactivity</li>
                  <li>Providing false, misleading, or inaccurate information</li>
                  <li>Breach of security or unauthorized access to your Account</li>
                  <li>Any conduct that we determine, in our sole discretion, is harmful to us, other Users, or third parties</li>
                  <li>Discontinuation or modification of the Service</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  We may terminate your Account immediately without prior notice if we reasonably believe that immediate action is 
                  necessary to protect the Service, other Users, or third parties from harm, fraud, or illegal activity.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">12.3 Effect of Termination</h3>
                <p className="text-gray-300 leading-relaxed mb-3">
                  Upon termination of your Account or these Terms:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-3">
                  <li>Your right to access and use the Service will immediately cease</li>
                  <li>You will lose access to your Account, Content, analysis history, saved conversations, and all associated data</li>
                  <li>We may delete, remove, or destroy your Account, Content, and associated data, subject to our data retention 
                  policies and legal obligations</li>
                  <li>You will not be entitled to any refund of subscription fees paid, except as required by law</li>
                  <li>All licenses granted to you under these Terms will immediately terminate</li>
                  <li>Provisions of these Terms that by their nature should survive termination will survive, including but not 
                  limited to indemnification, disclaimers, limitations of liability, and intellectual property provisions</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 
              30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. 
              By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to its conflict of law provisions. 
              Any disputes arising from these Terms or the Service shall be resolved in the appropriate courts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us through the Service or at our support channels.
            </p>
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

