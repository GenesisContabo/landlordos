export default function Footer() {
  return (
    <footer className="border-t border-slate-700 bg-background mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="text-xl font-bold text-primary">LandlordOS</span>
            <p className="mt-2 text-sm text-muted">
              Your Property, Simplified
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="text-muted hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="text-muted hover:text-primary transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted hover:text-primary transition-colors">About</a></li>
              <li><a href="#" className="text-muted hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="text-muted hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted hover:text-primary transition-colors">Privacy</a></li>
              <li><a href="#" className="text-muted hover:text-primary transition-colors">Terms</a></li>
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
