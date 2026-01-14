import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-slate-700 bg-background mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="text-xl font-bold text-primary">LandlordOS</Link>
            <p className="mt-2 text-sm text-muted">
              Your Property, Simplified
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/features" className="text-muted hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-muted hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/features" className="text-muted hover:text-primary transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/" className="text-muted hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/" className="text-muted hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link href="/" className="text-muted hover:text-primary transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-700 text-center text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} LandlordOS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
