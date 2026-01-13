// Centralized Metadata Configuration for SEO
import { Metadata } from 'next';

const siteConfig = {
  name: 'LandlordOS',
  description: 'Modern property management software for landlords. Manage properties, tenants, maintenance, and rent payments all in one place.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://landlordos.com',
  ogImage: '/og-image.png',
  creator: 'LandlordOS Team',
};

export function createMetadata({
  title,
  description,
  path = '',
  image,
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const pageTitle = title === siteConfig.name ? title : `${title} - ${siteConfig.name}`;
  const pageDescription = description || siteConfig.description;
  const pageUrl = `${siteConfig.url}${path}`;
  const pageImage = image || siteConfig.ogImage;

  return {
    title: pageTitle,
    description: pageDescription,
    creator: siteConfig.creator,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      creator: '@landlordos',
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}

export const defaultMetadata: Metadata = createMetadata({
  title: siteConfig.name,
  description: siteConfig.description,
});
