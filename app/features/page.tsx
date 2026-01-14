import { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';
import Link from 'next/link';

export const metadata: Metadata = createMetadata({
  title: 'Features - LandlordOS',
  description: 'Powerful property management features designed specifically for landlords. Track properties, tenants, maintenance, and payments all in one place.',
  path: '/features',
});

export default function FeaturesPage() {
  const features = [
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
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Features Built for
              <span className="block text-primary mt-2">Modern Landlords</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Everything you need to manage your rental properties efficiently and professionally
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
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
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join landlords who are managing their properties more efficiently with LandlordOS
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
      </section>
    </div>
  );
}
