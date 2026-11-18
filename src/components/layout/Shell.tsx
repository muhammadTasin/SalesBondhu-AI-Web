import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { AlertTriangle, ClipboardCheck, LayoutDashboard, Map, Settings, Target, Users } from 'lucide-react';
import type { ComponentType } from 'react';
import { useLang } from '../../i18n/lang';
import { SosBanner } from '../../features/sos/SosBanner';

interface NavItem {
  to: string;
  en: string;
  bn: string;
  icon: ComponentType<{ size?: number }>;
  disabled?: boolean;
}

const GROUPS: { en: string; bn: string; items: NavItem[] }[] = [
  {
    en: 'Monitor',
    bn: 'নজরদারি',
    items: [
      { to: '/', en: 'Overview', bn: 'সারসংক্ষেপ', icon: LayoutDashboard },
      { to: '/map', en: 'Live map', bn: 'লাইভ ম্যাপ', icon: Map },
      { to: '/team', en: 'Team', bn: 'টিম', icon: Users },
    ],
  },
  {
    en: 'Act',
    bn: 'পদক্ষেপ',
    items: [
      { to: '/alerts', en: 'Alerts', bn: 'অ্যালার্ট', icon: AlertTriangle },
      { to: '/review', en: 'Visit review', bn: 'ভিজিট রিভিউ', icon: ClipboardCheck },
    ],
  },
  { en: 'Analyse', bn: 'বিশ্লেষণ', items: [{ to: '/targets', en: 'Targets', bn: 'টার্গেট', icon: Target }] },
  { en: 'Admin', bn: 'অ্যাডমিন', items: [{ to: '/setup', en: 'Setup', bn: 'সেটআপ', icon: Settings, disabled: true }] },
];

export function Shell() {
  const { t, lang, setLang } = useLang();
  return (
    <div className="min-h-full md:flex">
      <aside className="md:w-60 md:min-h-screen bg-sidebar text-white/80 flex md:flex-col shrink-0 overflow-x-auto">
        <div className="px-5 py-5 hidden md:block">
          <div className="text-white font-semibold text-lg leading-tight">SalesBondhu AI</div>
          <div className="text-xs text-white/50">{t('Manager console', 'ম্যানেজার কনসোল')}</div>
        </div>
        <nav className="flex md:flex-col gap-1 md:gap-4 px-2 md:px-3 py-2 md:py-0">
          {GROUPS.map((g) => (
            <div key={g.en} className="flex md:block gap-1">
              <div className="hidden md:block px-2 pb-1 text-[11px] uppercase tracking-wider text-white/40">{t(g.en, g.bn)}</div>
              {g.items.map((it) =>
                it.disabled ? (
                  <span key={it.to} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-white/30 cursor-not-allowed whitespace-nowrap" title={t('Not part of the showcase', 'শোকেসে নেই')}>
                    <it.icon size={17} />
                    {t(it.en, it.bn)}
                  </span>
                ) : (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.to === '/'}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm whitespace-nowrap transition-colors',
                        isActive ? 'bg-white/10 text-white border-l-2 border-accent' : 'hover:bg-white/5',
                      )
                    }
                  >
                    <it.icon size={17} />
                    {t(it.en, it.bn)}
                  </NavLink>
                ),
              )}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="h-14 bg-white border-b border-line flex items-center justify-between px-4 md:px-6 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-full bg-[#006c49] text-white text-[11px] font-bold flex items-center justify-center shrink-0">SP</span>
            <span className="text-sm font-medium truncate">
              {t('Shapla Paints', 'শাপলা পেইন্টস')} <span className="text-ink-muted font-normal">· {t('demo client', 'ডেমো ক্লায়েন্ট')}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs bg-review-bg text-review rounded-full px-2.5 py-1">
              {t('Showcase edition · mock data', 'শোকেস সংস্করণ · ডেমো ডেটা')}
            </span>
            <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="btn-ghost !py-1 text-xs">
              {lang === 'bn' ? 'বাং | EN' : 'EN | বাং'}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-50 text-primary text-xs font-semibold flex items-center justify-center">KH</span>
              <div className="text-xs leading-tight">
                <div className="font-medium">{t('Kamrul Hasan', 'কামরুল হাসান')}</div>
                <div className="text-ink-muted">{t('Regional manager', 'আঞ্চলিক ম্যানেজার')}</div>
              </div>
            </div>
          </div>
        </header>
        <SosBanner />
        <main className="p-4 md:p-6 max-w-[1280px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
