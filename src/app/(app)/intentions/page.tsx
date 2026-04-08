"use client";

import { useState, useEffect, useTransition } from "react";
import { MaterialIcon } from "@/components/material-icon";
import { createClient } from "@/lib/supabase/client";

interface Intention {
  id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  profile?: { display_name: string } | null;
  prayer_count: number;
  has_prayed: boolean;
}

export default function IntentionsPage() {
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadIntentions();
  }, [tab]);

  async function loadIntentions() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);

    const baseQuery = supabase
      .from("intentions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const { data } = tab === "mine" && user
      ? await baseQuery.eq("user_id", user.id)
      : await baseQuery;

    if (data) {
      const intentionIds = data.map((i) => i.id);
      const userIds = [...new Set(data.map((i) => i.user_id))];

      // Fetch display names
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", userIds);

      const profileMap = new Map(
        (profiles ?? []).map((p: { id: string; display_name: string }) => [p.id, p.display_name])
      );

      // Fetch prayer counts
      let prayerCounts: { intention_id: string }[] = [];
      if (intentionIds.length > 0) {
        const { data: pc } = await supabase
          .from("intention_prayers")
          .select("intention_id")
          .in("intention_id", intentionIds);
        prayerCounts = pc ?? [];
      }

      const countMap = new Map<string, number>();
      prayerCounts.forEach((p: { intention_id: string }) => {
        countMap.set(p.intention_id, (countMap.get(p.intention_id) ?? 0) + 1);
      });

      // Fetch user's own prayers
      let myPrayerSet = new Set<string>();
      if (user && intentionIds.length > 0) {
        const { data: myPrayers } = await supabase
          .from("intention_prayers")
          .select("intention_id")
          .eq("user_id", user.id)
          .in("intention_id", intentionIds);
        myPrayerSet = new Set(
          (myPrayers ?? []).map((p: { intention_id: string }) => p.intention_id)
        );
      }

      setIntentions(
        data.map((item) => ({
          id: item.id,
          user_id: item.user_id,
          content: item.content,
          is_anonymous: item.is_anonymous,
          created_at: item.created_at,
          profile: { display_name: profileMap.get(item.user_id) ?? "Unknown" },
          prayer_count: countMap.get(item.id) ?? 0,
          has_prayed: myPrayerSet.has(item.id),
        }))
      );
    }
  }

  async function handleSubmitIntention() {
    if (!newContent.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    startTransition(async () => {
      await supabase.from("intentions").insert({
        user_id: user.id,
        content: newContent.trim(),
        is_anonymous: isAnonymous,
      });
      setNewContent("");
      setIsAnonymous(false);
      setShowNewForm(false);
      loadIntentions();
    });
  }

  async function handlePray(intentionId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const intention = intentions.find((i) => i.id === intentionId);
    if (!intention) return;

    if (intention.has_prayed) {
      await supabase
        .from("intention_prayers")
        .delete()
        .eq("intention_id", intentionId)
        .eq("user_id", user.id);
    } else {
      await supabase.from("intention_prayers").insert({
        intention_id: intentionId,
        user_id: user.id,
      });
    }

    loadIntentions();
  }

  function getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-7.5rem)]">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="font-headline italic text-5xl text-primary-fixed sacred-glow mb-1">
          Sacred
        </h1>
        <h1 className="font-headline italic text-5xl text-on-surface mb-4">
          Intentions
        </h1>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-outline-variant/20">
          <button
            onClick={() => setTab("all")}
            className={`pb-3 text-sm font-semibold tracking-widest uppercase transition-all ${
              tab === "all"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTab("mine")}
            className={`pb-3 text-sm font-semibold tracking-widest uppercase transition-all ${
              tab === "mine"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant"
            }`}
          >
            My Intentions
          </button>
        </div>
      </div>

      {/* Featured Card */}
      <div className="px-6 mb-4">
        <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-surface-container-high to-surface-container p-6">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <MaterialIcon name="format_quote" size={32} className="text-primary/40 mb-2" />
            <p className="font-headline italic text-lg text-primary-fixed leading-relaxed mb-3">
              &ldquo;Bear one another&apos;s burdens, and so fulfill the law of Christ.&rdquo;
            </p>
            <p className="text-on-surface-variant text-xs tracking-widest uppercase font-semibold">
              Galatians 6:2
            </p>
          </div>
        </div>
      </div>

      {/* Intentions List */}
      <div className="flex-1 px-6 space-y-3 pb-6">
        {intentions.length === 0 && (
          <div className="text-center py-12">
            <MaterialIcon name="favorite_border" size={48} className="text-on-surface-variant/30 mb-3" />
            <p className="text-on-surface-variant text-sm">
              {tab === "mine"
                ? "You haven't shared any intentions yet."
                : "No intentions yet. Be the first to share."}
            </p>
          </div>
        )}

        {intentions.map((intention) => {
          const displayName = intention.is_anonymous
            ? "Anonymous"
            : intention.profile?.display_name ?? "Unknown";
          const initials = intention.is_anonymous
            ? "A"
            : getInitials(displayName);

          return (
            <div
              key={intention.id}
              className="glass-card rounded-2xl p-4 border border-outline-variant/10"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-on-surface-variant">
                    {initials}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-on-surface">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      {getTimeAgo(intention.created_at)}
                    </span>
                  </div>

                  <p className="font-headline italic text-on-surface/80 text-sm leading-relaxed mb-3">
                    {intention.content}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-on-surface-variant text-xs">
                      <MaterialIcon
                        name="favorite"
                        filled
                        size={14}
                        className="text-primary/60"
                      />
                      <span>{intention.prayer_count}</span>
                    </div>
                    <button
                      onClick={() => handlePray(intention.id)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase transition-all active:scale-95 ${
                        intention.has_prayed
                          ? "bg-primary/20 text-primary"
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}
                    >
                      <MaterialIcon
                        name="self_improvement"
                        size={14}
                        filled={intention.has_prayed}
                      />
                      {intention.has_prayed ? "Prayed" : "Pray"}
                    </button>

                    {/* Flag button (not own intentions) */}
                    {userId && intention.user_id !== userId && (
                      <button
                        className="ml-auto text-on-surface-variant/30 hover:text-on-surface-variant transition-colors"
                        aria-label="Report intention"
                      >
                        <MaterialIcon name="flag" size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowNewForm(true)}
        className="fixed bottom-20 right-4 w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-2xl transition-all active:scale-90 z-40"
        aria-label="New intention"
      >
        <MaterialIcon name="add" size={28} />
      </button>

      {/* New Intention Modal */}
      {showNewForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowNewForm(false)}
          />
          <div className="relative glass-panel w-full max-w-lg rounded-t-[32px] p-6 border-t border-outline-variant/20">
            <div className="w-12 h-1 bg-outline-variant/40 rounded-full mx-auto mb-6" />
            <h3 className="font-headline italic text-2xl text-primary-fixed sacred-glow mb-4">
              Share Your Intention
            </h3>
            <textarea
              placeholder="What would you like others to pray for?"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full h-32 bg-surface-container rounded-2xl p-4 text-on-surface placeholder:text-on-surface-variant/40 resize-none outline-none border border-outline-variant/20 focus:border-primary/40 transition-colors font-headline italic"
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-3 mb-4">
              <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="accent-primary"
                />
                Post anonymously
              </label>
              <span className="text-[10px] text-on-surface-variant">
                {newContent.length}/500
              </span>
            </div>
            <button
              onClick={handleSubmitIntention}
              disabled={!newContent.trim() || isPending}
              className="w-full py-4 bg-primary-container text-on-primary-container text-center font-label text-sm font-semibold tracking-widest uppercase rounded-2xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {isPending ? "Sharing..." : "Share Intention"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
