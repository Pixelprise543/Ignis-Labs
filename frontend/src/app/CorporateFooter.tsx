import { Link } from 'react-router-dom';

const footerLinks = [
  { to: '/product', label: 'Product' },
  { to: '/solutions', label: 'Solutions' },
  { to: '/technology', label: 'Technology' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
];

const contactLinks = [
  { to: 'mailto:hello@ignislabs.example', label: 'hello@ignislabs.example' },
  { to: '/about', label: 'Company' },
  { to: '/about', label: 'Legal' },
];

export function CorporateFooter() {
  return (
    <footer className="border-t border-white/5 bg-void-900 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-ember-400 mb-4">
              Ignis Labs
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Microgravity fire safety for the next era of orbital research.
            </p>
          </div>
          <div className="hidden md:flex flex-col gap-2">
            {footerLinks.slice(0, 3).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-slate-400 hover:text-slate-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex flex-col gap-2">
            {footerLinks.slice(3).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-slate-400 hover:text-slate-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {contactLinks.map((link) => (
              <a
                key={link.to}
                href={link.to}
                className="text-sm text-slate-400 hover:text-slate-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div
          className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500"
        >
          <p>
            © {new Date().getFullYear()} Ignis Labs. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="/" className="hover:text-slate-200">
              Privacy
            </a>
            <a href="/" className="hover:text-slate-200">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
