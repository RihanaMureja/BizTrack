import { Link } from '@inertiajs/react';
import { login, register } from '@/routes';

type SiteFooterProps = { landingPage?: boolean };

export function SiteFooter({ landingPage = true }: SiteFooterProps) {
    const landing = (hash: string) => (landingPage ? hash : `/${hash}`);
    const linkClass = 'transition-colors hover:text-white hover:underline hover:underline-offset-4';

    return (
        <footer data-header-theme="dark" className="border-t border-emerald-100/10 bg-emerald-950 text-white">
            <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-5 sm:py-14 lg:px-8">
                <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))] xl:gap-8">
                    <div className="max-w-sm">
                        <div className="inline-flex rounded-lg bg-white p-1.5 shadow-sm"><img src="/brand/biztrack-logo.jpg" alt="BizTrack" className="h-9 w-auto rounded-sm object-contain" /></div>
                        <p className="mt-5 text-sm leading-7 text-emerald-50/75">BizTrack helps product-based businesses manage sales, inventory, expenses, customers, employees, and business performance from one connected platform.</p>
                        <p className="mt-5 text-sm font-semibold tracking-wide text-emerald-300">Track. Manage. Grow.</p>
                    </div>
                    <FooterColumn title="Product" links={[
                        ['Features', landing('#features')], ['Inventory', landing('#inventory')], ['Sales', landing('#features')], ['Expenses', landing('#features')], ['Reports', landing('#insights')], ['Pricing', landing('#pricing')],
                    ]} className={linkClass} />
                    <FooterColumn title="Solutions" links={['Grocery & Mini Market', 'Clothing & Fashion', 'Cosmetics & Beauty', 'Electronics', 'Hardware & Building Materials', 'General Retail'].map((label) => [label, landing('#about')])} className={linkClass} />
                    <FooterColumn title="Company" links={[
                        ['About Us', landing('#about')], ['How It Works', landing('#how-it-works')], ['FAQ', landing('#faq')], ['Contact Us', landing('#contact')],
                    ]} className={linkClass} />
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">Account</h3>
                        <ul className="mt-5 space-y-3 text-sm text-emerald-50/70">
                            <li><Link href={login()} className={linkClass}>Login</Link></li>
                            <li><Link href={register()} className={linkClass}>Get Started</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 flex flex-col gap-4 border-t border-emerald-100/10 pt-6 text-sm text-emerald-50/55 sm:flex-row sm:items-center sm:justify-between">
                    <p>© 2026 BizTrack. All rights reserved.</p>
                    <div className="flex items-center gap-5"><Link href="/privacy-policy" className={linkClass}>Privacy Policy</Link><Link href="/terms-of-service" className={linkClass}>Terms of Service</Link></div>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({ title, links, className }: { title: string; links: string[][]; className: string }) {
    return <div><h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">{title}</h3><ul className="mt-5 space-y-3 text-sm text-emerald-50/70">{links.map(([label, href]) => <li key={label}><a href={href} className={className}>{label}</a></li>)}</ul></div>;
}
