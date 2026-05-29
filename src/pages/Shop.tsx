import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Coins, Check, Lock } from 'lucide-react';
import {
  useGamificationState,
  useShopItems,
  usePurchaseShopItem,
  useSelectCosmetic,
  useClearCosmetic,
} from '@/hooks/useGamification';
import type { ShopCategory } from '@/services/gamification';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const SERIF = "'Cormorant Garamond', 'Amiri', Georgia, serif";

const CATEGORY_META: Record<ShopCategory, { label: string; subtitle: string }> = {
  name_color: { label: 'ألوان الاسم', subtitle: 'لمسة لونية تُميّز اسمك في كل مكان' },
  avatar_frame: { label: 'إطارات الصورة', subtitle: 'إطار راقٍ يُحيط صورتك الشخصية' },
  badge: { label: 'الشارات', subtitle: 'رموز صغيرة تروي إنجازك' },
  comment_highlight: { label: 'تمييز التعليقات', subtitle: 'اجعل تعليقاتك تلفت الأنظار' },
  profile_background: { label: 'خلفيات الملف', subtitle: 'أجواء بصرية لملفك الشخصي' },
};

const CATEGORY_ORDER: ShopCategory[] = [
  'name_color', 'avatar_frame', 'badge', 'comment_highlight', 'profile_background',
];

const Shop: React.FC = () => {
  const { user } = useAuth();
  const { data: state } = useGamificationState();
  const { data: items, isLoading } = useShopItems();
  const purchase = usePurchaseShopItem();
  const selectCosmetic = useSelectCosmetic();
  const clearCosmetic = useClearCosmetic();

  const ownedIds = useMemo(() => new Set(state?.purchases.map((p) => p.item_id) ?? []), [state]);
  const grouped = useMemo(() => {
    const map = new Map<ShopCategory, NonNullable<typeof items>>();
    (items ?? []).forEach((it) => {
      const arr = map.get(it.category) ?? [];
      arr.push(it);
      map.set(it.category, arr);
    });
    return map;
  }, [items]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center" dir="rtl">
        <h1 className="text-3xl mb-4" style={{ fontFamily: SERIF }}>سجّل الدخول لزيارة المتجر</h1>
        <Link to="/auth"><Button>تسجيل الدخول</Button></Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>;
  }

  const userCoins = state?.coins ?? 0;
  const categories = CATEGORY_ORDER.filter((c) => grouped.has(c));

  return (
    <div className="min-h-screen pb-32 md:pb-16 bg-background" dir="rtl">
      <Helmet><title>متجر النقاط — كتبي</title></Helmet>

      {/* Hero — هادئ، بدون تدرّجات ثقيلة */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-5 py-10 md:py-14 max-w-5xl">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase mb-3">Kotobi · Boutique</p>
              <h1 className="text-4xl md:text-5xl leading-tight" style={{ fontFamily: SERIF, fontWeight: 600 }}>
                المتجر
              </h1>
              <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-md">
                مجموعة مختارة من العناصر التجميلية. ادفع بعملاتك واصنع طابعك.
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <Coins className="w-5 h-5 text-foreground/70" />
              <span className="text-3xl md:text-4xl" style={{ fontFamily: SERIF, fontWeight: 600 }} dir="ltr">
                {userCoins.toLocaleString('en')}
              </span>
              <span className="text-xs text-muted-foreground">رصيدك</span>
            </div>
          </div>
        </div>
      </header>

      {/* Quick nav */}
      <nav className="border-b border-border bg-background sticky top-0 z-10">
        <div className="container mx-auto px-5 max-w-5xl flex gap-6 overflow-x-auto py-3 text-sm">
          {categories.map((cat) => (
            <a
              key={cat}
              href={`#${cat}`}
              className="whitespace-nowrap text-muted-foreground hover:text-foreground transition-colors"
            >
              {CATEGORY_META[cat].label}
            </a>
          ))}
        </div>
      </nav>

      {/* Sections — full-width per category */}
      {categories.map((cat, idx) => {
        const meta = CATEGORY_META[cat];
        const list = grouped.get(cat) ?? [];
        return (
          <section
            id={cat}
            key={cat}
            className={`border-b border-border ${idx % 2 === 1 ? 'bg-card' : ''}`}
          >
            <div className="container mx-auto px-5 py-12 md:py-16 max-w-5xl">
              <div className="mb-8 md:mb-10">
                <span className="text-xs text-muted-foreground tracking-widest">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h2 className="text-3xl md:text-4xl mt-1" style={{ fontFamily: SERIF, fontWeight: 600 }}>
                  {meta.label}
                </h2>
                <p className="text-muted-foreground text-sm mt-2 max-w-md">{meta.subtitle}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {list.map((item) => {
                  const owned = ownedIds.has(item.id);
                  const selected =
                    (item.category === 'name_color' && state?.selected_name_color === item.preview_value) ||
                    (item.category === 'avatar_frame' && state?.selected_avatar_frame === item.preview_value) ||
                    (item.category === 'profile_background' && state?.selected_profile_background === item.preview_value) ||
                    (item.category === 'badge' && state?.selected_badge === item.preview_value) ||
                    (item.category === 'comment_highlight' && state?.selected_comment_highlight === item.preview_value);
                  const canAfford = userCoins >= item.price_coins;

                  return (
                    <article key={item.id} className="group flex flex-col">
                      <div className="relative bg-muted overflow-hidden aspect-[4/5] mb-3 border border-border">
                        <PreviewBlock item={item} />
                        {selected && (
                          <span className="absolute top-2 right-2 text-[10px] tracking-wider uppercase bg-foreground text-background px-2 py-0.5 flex items-center gap-1">
                            <Check className="w-3 h-3" /> مُطبَّق
                          </span>
                        )}
                        {owned && !selected && (
                          <span className="absolute top-2 right-2 text-[10px] tracking-wider uppercase bg-background/90 text-foreground px-2 py-0.5 border border-border">
                            مملوك
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg leading-snug" style={{ fontFamily: SERIF, fontWeight: 600 }}>
                        {item.title_ar}
                      </h3>
                      {item.description_ar && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {item.description_ar}
                        </p>
                      )}

                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-sm font-medium" dir="ltr">
                          <Coins className="w-3.5 h-3.5" />
                          {item.price_coins.toLocaleString('en')}
                        </span>

                        {owned ? (
                          selected ? (
                            <button
                              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
                              onClick={() => clearCosmetic.mutate(item.category)}
                            >
                              إزالة
                            </button>
                          ) : (
                            <button
                              className="text-xs font-medium text-foreground hover:opacity-70 underline underline-offset-4"
                              onClick={() => selectCosmetic.mutate(item.id)}
                            >
                              تطبيق
                            </button>
                          )
                        ) : (
                          <button
                            disabled={purchase.isPending || !canAfford}
                            onClick={() => purchase.mutate(item.id)}
                            className="text-xs font-medium px-3 py-1.5 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-foreground"
                          >
                            {canAfford ? 'شراء' : (
                              <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> غير كافٍ</span>
                            )}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {list.length === 0 && (
                <p className="text-center py-10 text-muted-foreground text-sm">لا توجد عناصر بعد</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};

const PreviewBlock: React.FC<{ item: { category: ShopCategory; preview_value: string | null; title_ar: string } }> = ({ item }) => {
  if (item.category === 'name_color') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span
          className="text-4xl"
          style={{ fontFamily: SERIF, fontWeight: 700, color: item.preview_value ?? undefined }}
        >
          كتبي
        </span>
      </div>
    );
  }
  if (item.category === 'avatar_frame') {
    const frameClass: Record<string, string> = {
      gold: 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-muted',
      neon: 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-muted',
      fire: 'ring-2 ring-orange-500 ring-offset-2 ring-offset-muted',
    };
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className={`w-20 h-20 rounded-full bg-foreground/10 ${frameClass[item.preview_value ?? ''] ?? 'ring-1 ring-border'}`} />
      </div>
    );
  }
  if (item.category === 'badge') {
    return (
      <div className="w-full h-full flex items-center justify-center text-6xl">
        {item.preview_value}
      </div>
    );
  }
  if (item.category === 'comment_highlight') {
    return (
      <div
        className="w-full h-full flex items-center justify-center p-4"
        style={{ background: item.preview_value ?? '#f5f3ee' }}
      >
        <span className="text-xs bg-background/80 px-2 py-1">تعليق مميّز</span>
      </div>
    );
  }
  return (
    <div
      className="w-full h-full"
      style={{ background: item.preview_value ?? '#141432' }}
    />
  );
};

export default Shop;
