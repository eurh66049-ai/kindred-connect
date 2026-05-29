import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Coins, Check, Sparkles, Palette, Frame, Award, MessageSquare, ImageIcon, Lock } from 'lucide-react';
import {
  useGamificationState,
  useShopItems,
  usePurchaseShopItem,
  useSelectCosmetic,
  useClearCosmetic,
} from '@/hooks/useGamification';
import type { ShopCategory } from '@/services/gamification';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const CATEGORY_META: Record<ShopCategory, { label: string; icon: React.ReactNode }> = {
  name_color: { label: 'ألوان الاسم', icon: <Palette className="w-4 h-4" /> },
  avatar_frame: { label: 'إطارات الصورة', icon: <Frame className="w-4 h-4" /> },
  badge: { label: 'الشارات', icon: <Award className="w-4 h-4" /> },
  comment_highlight: { label: 'تمييز التعليقات', icon: <MessageSquare className="w-4 h-4" /> },
  profile_background: { label: 'خلفيات الملف', icon: <ImageIcon className="w-4 h-4" /> },
};

const Shop: React.FC = () => {
  const { user } = useAuth();
  const { data: state } = useGamificationState();
  const { data: items, isLoading } = useShopItems();
  const purchase = usePurchaseShopItem();
  const selectCosmetic = useSelectCosmetic();
  const clearCosmetic = useClearCosmetic();
  const [activeCat, setActiveCat] = useState<ShopCategory>('name_color');

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
      <div className="container mx-auto px-4 py-16 text-center" dir="rtl">
        <h1 className="text-2xl font-bold mb-4">سجّل الدخول لزيارة المتجر</h1>
        <Link to="/auth"><Button>تسجيل الدخول</Button></Link>
      </div>
    );
  }

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>;

  const categories = Array.from(grouped.keys());
  const userCoins = state?.coins ?? 0;

  return (
    <div className="min-h-screen pb-32 md:pb-10" dir="rtl">
      <Helmet><title>متجر النقاط — كتبي</title></Helmet>

      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="container mx-auto px-4 py-8 max-w-5xl relative">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm opacity-90 mb-1">
                <Sparkles className="w-4 h-4" /> متجر كتبي
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold">خصّص ملفك وتألق ✨</h1>
              <p className="opacity-90 mt-1 text-sm">اشترِ عناصر تجميلية باستخدام عملات كتبي</p>
            </div>

            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20 shadow-lg">
              <div className="text-xs opacity-80">رصيدك</div>
              <div className="flex items-center gap-2 text-2xl font-extrabold" dir="ltr">
                <Coins className="w-6 h-6 text-yellow-200" />
                <span>{userCoins.toLocaleString('en')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-4 max-w-5xl">
        {/* Sticky category pills */}
        <div className="sticky top-2 z-10 mb-6">
          <div className="bg-card/80 backdrop-blur-md rounded-2xl shadow-md border p-2 flex gap-2 overflow-x-auto">
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat];
              const active = activeCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-sm font-bold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-105'
                      : 'hover:bg-muted text-foreground/70'
                  }`}
                >
                  {meta.icon}
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {(grouped.get(activeCat) ?? []).map((item) => {
            const owned = ownedIds.has(item.id);
            const selected =
              (item.category === 'name_color' && state?.selected_name_color === item.preview_value) ||
              (item.category === 'avatar_frame' && state?.selected_avatar_frame === item.preview_value) ||
              (item.category === 'profile_background' && state?.selected_profile_background === item.preview_value) ||
              (item.category === 'badge' && state?.selected_badge === item.preview_value) ||
              (item.category === 'comment_highlight' && state?.selected_comment_highlight === item.preview_value);
            const canAfford = userCoins >= item.price_coins;
            const isCosmetic = true;

            return (
              <Card
                key={item.id}
                className={`group relative overflow-hidden flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 ${
                  selected ? 'ring-2 ring-amber-500 shadow-amber-200/50 shadow-lg' : ''
                }`}
              >
                {selected && (
                  <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow">
                    <Check className="w-3 h-3" /> مُطبَّق
                  </div>
                )}
                {owned && !selected && (
                  <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                    مملوك
                  </div>
                )}

                <PreviewBlock item={item} />

                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-bold text-sm line-clamp-1">{item.title_ar}</h3>
                  {item.description_ar && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 flex-1">{item.description_ar}</p>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-sm font-bold bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-lg" dir="ltr">
                      <Coins className="w-3.5 h-3.5" />
                      {item.price_coins.toLocaleString('en')}
                    </span>

                    {owned ? (
                      selected ? (
                        isCosmetic ? (
                          <Button size="sm" variant="ghost" onClick={() => clearCosmetic.mutate(item.category)}>
                            إزالة
                          </Button>
                        ) : (
                          <Badge variant="secondary"><Check className="w-3 h-3 ml-1" /> مفعّل</Badge>
                        )
                      ) : isCosmetic ? (
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600" onClick={() => selectCosmetic.mutate(item.id)}>
                          تطبيق
                        </Button>
                      ) : (
                        <Badge variant="secondary">مملوك</Badge>
                      )
                    ) : (
                      <Button
                        size="sm"
                        disabled={purchase.isPending || !canAfford}
                        onClick={() => purchase.mutate(item.id)}
                        className={canAfford ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white' : ''}
                        variant={canAfford ? 'default' : 'outline'}
                      >
                        {canAfford ? 'شراء' : <><Lock className="w-3 h-3 ml-1" /> غير كافٍ</>}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {(grouped.get(activeCat) ?? []).length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            لا توجد عناصر في هذا التصنيف بعد
          </div>
        )}
      </div>
    </div>
  );
};

const PreviewBlock: React.FC<{ item: { category: ShopCategory; preview_value: string | null; title_ar: string } }> = ({ item }) => {
  if (item.category === 'name_color') {
    return (
      <div className="h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
        <span className="text-3xl font-extrabold drop-shadow-sm" style={{ color: item.preview_value ?? undefined }}>
          كتبي
        </span>
      </div>
    );
  }
  if (item.category === 'avatar_frame') {
    const frameClass: Record<string, string> = {
      gold: 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-background',
      neon: 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-background shadow-[0_0_20px_rgba(34,211,238,0.7)]',
      fire: 'ring-4 ring-orange-500 ring-offset-2 ring-offset-background shadow-[0_0_20px_rgba(249,115,22,0.8)]',
    };
    return (
      <div className="h-24 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 flex items-center justify-center">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 ${frameClass[item.preview_value ?? ''] ?? 'ring-2 ring-border'}`} />
      </div>
    );
  }
  if (item.category === 'badge') {
    return (
      <div className="h-24 bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-950/40 flex items-center justify-center text-5xl">
        {item.preview_value}
      </div>
    );
  }
  if (item.category === 'comment_highlight') {
    return (
      <div className="h-24 flex items-center justify-center p-3" style={{ background: item.preview_value ?? 'linear-gradient(135deg,#fde68a,#fca5a5)' }}>
        <span className="text-xs bg-white/80 px-2 py-1 rounded">تعليق مميّز</span>
      </div>
    );
  }
  return (
    <div
      className="h-24"
      style={{
        background: item.preview_value ?? 'linear-gradient(135deg, #fcd34d, #fb923c)',
      }}
    />
  );
};

export default Shop;
