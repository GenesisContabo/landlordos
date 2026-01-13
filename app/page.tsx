import { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';
import JsonLd, { organizationSchema, softwareApplicationSchema } from '@/components/seo/JsonLd';
import Link from 'next/link';

export const metadata: Metadata = createMetadata({
  title: 'LandlordOS',
  description: 'Modern property management software for landlords. Manage properties, tenants, maintenance, and rent payments all in one place.',
  path: '/',
});

export default function Home() {
  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={softwareApplicationSchema} />

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Property Management
                <span className="block text-primary mt-2">Made Simple</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Modern property management software built for landlords. Manage properties, tenants, maintenance requests, and payments—all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-secondary/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Everything You Need
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed specifically for landlords managing multiple properties
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Property Management',
                  description: 'Track properties, units, and important details all in one centralized dashboard.',
                },
                {
                  title: 'Tenant Portal',
                  description: 'Give tenants a seamless experience to submit requests and make payments.',
                },
                {
                  title: 'Maintenance Tracking',
                  description: 'Manage maintenance requests from submission to completion with status updates.',
                },
                {
                  title: 'Payment Processing',
                  description: 'Secure online rent collection with automatic receipts and payment history.',
                },
                {
                  title: 'Financial Reports',
                  description: 'Track income, expenses, and generate reports for tax season.',
                },
                {
                  title: 'Mobile Friendly',
                  description: 'Access your dashboard anywhere, anytime from any device.',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Simplify Property Management?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join landlords who are already managing their properties more efficiently with LandlordOS
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
