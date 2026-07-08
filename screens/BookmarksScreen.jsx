/**
 * BookmarksScreen.jsx — Safar
 * Redesigned: unified bookmarks v2 model, filter pills, grid/list toggle.
 */
import React, { useState, useEffect, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, TextInput, KeyboardAvoidingView,
  Platform, Linking, Alert, Share, StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { DUAS } from "../dua-content";
import {
  getDuaBookmarks, setDuaBookmarked,
  getMediaBookmarks, setMediaBookmarked,
} from "../bookmarkStore";
import { MEDIA } from "./MediaScreen";
import { useAccessibility } from "../AccessibilityContext";
import {
  CaretLeft, Plus, BookmarkSimple, SquaresFour, List,
  DotsThree, HandsPraying, Link, PlayCircle,
  Microphone, Article, CheckCircle,
  BookOpenText, Headphones, MagnifyingGlass,
} from "phosphor-react-native";

const SERIF     = "SourceSerif4-Regular";
const V2_KEY    = "safar_bookmarks_v2";
const LINKS_KEY = "safar_bookmark_links_v1";

const TYPE_CONFIG = {
  dua:     { color: "#3D5C3A", label: "Dua",     BgIcon: BookOpenText },
  link:    { color: "#2A5068", label: "Link",     BgIcon: Link        },
  video:   { color: "#2C3E5A", label: "Video",    BgIcon: PlayCircle  },
  podcast: { color: "#4A2E5C", label: "Podcast",  BgIcon: Headphones  },
  article: { color: "#6B4A1A", label: "Article",  BgIcon: Article     },
};

const FILTERS = [
  { key: "all",     label: "All",     Icon: BookmarkSimple },
  { key: "dua",     label: "Duʿā",    Icon: HandsPraying  },
  { key: "link",    label: "Link",    Icon: Link           },
  { key: "video",   label: "Video",   Icon: PlayCircle     },
  { key: "podcast", label: "Podcast", Icon: Headphones     },
  { key: "article", label: "Article", Icon: Article        },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatRelativeDate(iso) {
  if (!iso) return "Saved recently";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Saved today";
  if (days === 1) return "Saved yesterday";
  return "Saved " + days + " days ago";
}

function getTypeIcon(type) {
  const props = { size: 22, color: "#C8A96A", weight: "regular" };
  switch (type) {
    case "dua":     return <HandsPraying {...props} />;
    case "link":    return <Link         {...props} />;
    case "video":   return <PlayCircle   {...props} />;
    case "podcast": return <Microphone   {...props} />;
    case "article": return <Article      {...props} />;
    default:        return <BookmarkSimple {...props} />;
  }
}

// ── Scholarly footnote ────────────────────────────────────────────────────────
function ScholarlyFootnote() {
  return (
    <View style={fn.wrap}>
      <Text style={fn.text}>
        <Text style={fn.bold}>Sources — </Text>
        Duʿāʾs are from authenticated hadith collections. Wording may differ across
        the four madhabs. Consult a qualified scholar for rulings specific to your school of thought.
      </Text>
    </View>
  );
}
const fn = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginTop: 20, marginBottom: 8, backgroundColor: "#F5EDD8", borderRadius: 10, borderWidth: 1, borderColor: "#E8D9B8", padding: 16 },
  text: { fontSize: 12, color: "#7A6030", lineHeight: 17 },
  bold: { fontWeight: "600" },
});

// ── Add Link Modal ────────────────────────────────────────────────────────────
function AddLinkModal({ visible, onSave, onClose }) {
  const [url,   setUrl]   = useState("");
  const [title, setTitle] = useState("");
  const [note,  setNote]  = useState("");

  const reset = () => { setUrl(""); setTitle(""); setNote(""); };
  const handleClose = () => { reset(); onClose(); };

  const handleSave = () => {
    const trimUrl = url.trim();
    if (!trimUrl) return;
    const finalUrl = trimUrl.startsWith("http") ? trimUrl : "https://" + trimUrl;
    onSave({
      id: "link-" + Date.now(),
      title: title.trim() || finalUrl,
      url: finalUrl,
      note: note.trim(),
      addedAt: new Date().toISOString(),
    });
    reset();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={ml.overlay}>
          <View style={ml.sheet}>
            <View style={ml.sheetHeader}>
              <TouchableOpacity onPress={handleClose}>
                <Text style={ml.cancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={ml.sheetTitle}>Add Bookmark</Text>
              <TouchableOpacity onPress={handleSave} disabled={!url.trim()}>
                <Text style={!url.trim() ? [ml.save, ml.saveDisabled] : ml.save}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={ml.tipCard}>
              <Text style={ml.tipIcon}>{"💡"}</Text>
              <Text style={ml.tipText}>
                Paste any URL here. On iPhone you can also tap Share in Safari {"→"} Copy Link,
                then paste it below. Native "Add to Safar" from the share sheet
                requires a development build.
              </Text>
            </View>

            <Text style={ml.fieldLabel}>URL *</Text>
            <TextInput
              style={ml.input}
              placeholder="https://example.com"
              placeholderTextColor="#5A5650"
              value={url}
              onChangeText={setUrl}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />

            <Text style={ml.fieldLabel}>Title (optional)</Text>
            <TextInput
              style={ml.input}
              placeholder="e.g. Sunnah.com — Hadith Reference"
              placeholderTextColor="#5A5650"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={ml.fieldLabel}>Note (optional)</Text>
            <TextInput
              style={[ml.input, ml.inputMulti]}
              placeholder="Why are you saving this?"
              placeholderTextColor="#5A5650"
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const ml = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet:        { backgroundColor: "#F0EBE0", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  sheetHeader:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  cancel:       { fontSize: 16, color: "#5A5650" },
  sheetTitle:   { fontFamily: SERIF, fontSize: 16, color: "#1A1712" },
  save:         { fontSize: 16, color: "#2F5D50", fontWeight: "600" },
  saveDisabled: { opacity: 0.35 },
  tipCard:      { flexDirection: "row", gap: 8, backgroundColor: "#EBF2EE", borderRadius: 10, borderWidth: 1, borderColor: "#C8DDD0", padding: 12, marginBottom: 16 },
  tipIcon:      { fontSize: 14, marginTop: 1 },
  tipText:      { flex: 1, fontSize: 12, color: "#2F5D50", lineHeight: 17 },
  fieldLabel:   { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, color: "#5A5650", marginBottom: 6 },
  input:        { backgroundColor: "#EDE6D8", borderRadius: 10, borderWidth: 1, borderColor: "#D4D0CA", paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, color: "#1A1712", marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  inputMulti:   { minHeight: 72, textAlignVertical: "top" },
  lockedHint:   { fontSize: 11, color: "#8A7D6A", marginBottom: 16, marginLeft: 2 },
});

// ── Edit Bookmark Modal ───────────────────────────────────────────────────────
function EditBookmarkModal({ visible, item, onSave, onClose }) {
  const [titleDraft, setTitleDraft] = useState("");
  const [noteDraft,  setNoteDraft]  = useState("");

  useEffect(() => {
    if (item) {
      setTitleDraft(item.title ?? "");
      setNoteDraft(item.note ?? "");
    }
  }, [item?.id]);

  const handleSave = () => {
    onSave(item.id, {
      title: titleDraft.trim() || item.title,
      note:  noteDraft.trim(),
    });
    onClose();
  };

  if (!item) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={ml.overlay}>
          <View style={ml.sheet}>
            <View style={ml.sheetHeader}>
              <TouchableOpacity onPress={onClose}>
                <Text style={ml.cancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={ml.sheetTitle}>Edit Bookmark</Text>
              <TouchableOpacity onPress={handleSave}>
                <Text style={ml.save}>Save</Text>
              </TouchableOpacity>
            </View>

            <Text style={ml.fieldLabel}>NAME</Text>
            <TextInput
              style={ml.input}
              placeholder="Display name for this bookmark"
              placeholderTextColor="#5A5650"
              value={titleDraft}
              onChangeText={setTitleDraft}
              autoFocus
            />
            {item.type === "dua" ? (
              <Text style={ml.lockedHint}>
                This renames the bookmark only — the full duʿā is unchanged.
              </Text>
            ) : null}

            <Text style={ml.fieldLabel}>PERSONAL NOTE</Text>
            <TextInput
              style={[ml.input, ml.inputMulti]}
              placeholder="e.g. Recite this during the first Tawaf…"
              placeholderTextColor="#5A5650"
              value={noteDraft}
              onChangeText={setNoteDraft}
              multiline
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function BookmarksScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);

  const [bookmarks,     setBookmarks]     = useState([]);
  const [activeFilter,  setActiveFilter]  = useState("all");
  const [viewMode,      setViewMode]      = useState("grid");
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [showToast,     setShowToast]     = useState(false);
  const [toastMessage,  setToastMessage]  = useState("");
  const [editItem,      setEditItem]      = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchText, setSearchText] = useState("");

  // ── Load + migrate bookmarks ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // Try v2 first
      const v2Raw = await AsyncStorage.getItem(V2_KEY).catch(() => null);
      if (v2Raw) {
        const v2 = JSON.parse(v2Raw);
        if (v2.length > 0) {
          if (!cancelled) setBookmarks(v2);
          return;
        }
      }

      // Migrate from old keys
      const [duaList, mediaList, linksRaw] = await Promise.all([
        getDuaBookmarks(),
        getMediaBookmarks(),
        AsyncStorage.getItem(LINKS_KEY).catch(() => null),
      ]);
      const linkList = linksRaw ? JSON.parse(linksRaw) : [];

      const duaBMs = duaList.map(({ id, addedAt }) => {
        const dua = DUAS.find(d => d.id === id);
        return dua ? {
          id: "bm-dua-" + id,
          type: "dua",
          title: dua.title,
          subtitle: dua.arabic || "",
          addedAt,
          url: null,
          duaId: id,
        } : null;
      }).filter(Boolean);

      const mediaBMs = mediaList.map(({ id, addedAt }) => {
        const m = MEDIA.find(x => x.id === id);
        return m ? {
          id: "bm-media-" + id,
          type: m.type,
          title: m.title,
          subtitle: m.desc || "",
          addedAt,
          url: m.url,
          duaId: null,
        } : null;
      }).filter(Boolean);

      const linkBMs = linkList.map(l => ({
        id: l.id,
        type: "link",
        title: l.title,
        subtitle: l.note || l.url,
        addedAt: l.addedAt,
        url: l.url,
        duaId: null,
      }));

      const merged = [...duaBMs, ...mediaBMs, ...linkBMs].sort((a, b) => {
        if (!a.addedAt) return 1;
        if (!b.addedAt) return -1;
        return b.addedAt.localeCompare(a.addedAt);
      });

      if (!cancelled) setBookmarks(merged);
      if (merged.length > 0) {
        AsyncStorage.setItem(V2_KEY, JSON.stringify(merged)).catch(() => {});
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Filtered list ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const byType = activeFilter === "all"
      ? bookmarks
      : bookmarks.filter(b => b.type === activeFilter);
    if (!searchText.trim()) return byType;
    const q = searchText.trim().toLowerCase();
    return byType.filter(b =>
      b.title?.toLowerCase().includes(q) ||
      b.subtitle?.toLowerCase().includes(q)
    );
  }, [bookmarks, activeFilter, searchText]);

  // All bookmarked duas (for DuaDetail prev/next nav)
  const allDuasForNav = useMemo(() =>
    bookmarks
      .filter(b => b.type === "dua" && b.duaId)
      .map(b => DUAS.find(d => d.id === b.duaId))
      .filter(Boolean),
  [bookmarks]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleTileTap = (item) => {
    if (item.type === "dua" && item.duaId) {
      const dua = DUAS.find(d => d.id === item.duaId);
      if (dua) {
        const idx = allDuasForNav.findIndex(d => d.id === item.duaId);
        navigation?.navigate?.("DuaDetail", {
          dua,
          allDuas: allDuasForNav,
          currentIndex: idx >= 0 ? idx : 0,
        });
      }
    } else if (item.url) {
      Linking.openURL(item.url);
    }
  };

  const removeBookmark = (id) => {
    const item = bookmarks.find(b => b.id === id);
    const next = bookmarks.filter(b => b.id !== id);
    setBookmarks(next);
    AsyncStorage.setItem(V2_KEY, JSON.stringify(next)).catch(() => {});

    // Keep old stores in sync so DuaDetailScreen / MediaScreen stay correct
    if (item) {
      if (item.type === "dua" && item.duaId) {
        setDuaBookmarked(item.duaId, false).catch(() => {});
      } else if (item.type === "video" || item.type === "podcast" || item.type === "article") {
        const mediaId = item.id.startsWith("bm-media-") ? item.id.slice(9) : item.id;
        setMediaBookmarked(mediaId, false).catch(() => {});
      } else if (item.type === "link") {
        const linkObjects = next
          .filter(b => b.type === "link")
          .map(b => ({ id: b.id, title: b.title, url: b.url, note: b.subtitle, addedAt: b.addedAt }));
        AsyncStorage.setItem(LINKS_KEY, JSON.stringify(linkObjects)).catch(() => {});
      }
    }

    setToastMessage("Bookmark removed");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleMenuPress = (item) => {
    Alert.alert(
      item.title,
      null,
      [
        {
          text: "Edit",
          onPress: () => {
            setEditItem(item);
            setShowEditModal(true);
          },
        },
        {
          text: "Share",
          onPress: () => Share.share({
            message: item.url
              ? item.title + "\n" + item.url
              : item.title,
          }),
        },
        {
          text: "Remove bookmark",
          style: "destructive",
          onPress: () => removeBookmark(item.id),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const addLink = (link) => {
    const newBM = {
      id: link.id,
      type: "link",
      title: link.title,
      subtitle: link.note || link.url,
      addedAt: link.addedAt,
      url: link.url,
      duaId: null,
    };
    const next = [newBM, ...bookmarks];
    setBookmarks(next);
    setShowAddModal(false);
    AsyncStorage.setItem(V2_KEY, JSON.stringify(next)).catch(() => {});
    const linkObjects = next
      .filter(b => b.type === "link")
      .map(b => ({ id: b.id, title: b.title, url: b.url, note: b.subtitle, addedAt: b.addedAt }));
    AsyncStorage.setItem(LINKS_KEY, JSON.stringify(linkObjects)).catch(() => {});
  };

  const handleEditSave = (id, changes) => {
    const next = bookmarks.map(b =>
      b.id !== id
        ? b
        : { ...b, title: changes.title, note: changes.note }
    );
    setBookmarks(next);
    AsyncStorage.setItem(V2_KEY, JSON.stringify(next)).catch(() => {});
  };

  const hasDuas = bookmarks.some(b => b.type === "dua");
  const showFootnote = hasDuas && (activeFilter === "all" || activeFilter === "dua");

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <CaretLeft size={20} color={colors.text} weight="bold" />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <View style={s.headerBadge}>
            <BookmarkSimple size={16} color={colors.text} weight="regular" />
          </View>
          <Text style={s.headerTitle}>Bookmarks</Text>
          <Text style={s.headerSub}>Save and organise what matters for your journey.</Text>
        </View>

        <TouchableOpacity style={s.addBtn} onPress={() => setShowAddModal(true)} activeOpacity={0.85}>
          <Plus size={20} color="#FFFFFF" weight="bold" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.outer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

      {/* ── Filter pills ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
      >
        {FILTERS.map(f => {
          const active = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={active ? [s.filterPill, s.filterPillActive] : s.filterPill}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.75}
            >
              <f.Icon
                size={15}
                color={active ? "#FFFFFF" : "#5C534A"}
                weight={active ? "fill" : "regular"}
              />
              <Text style={active ? [s.filterLabel, s.filterLabelActive] : s.filterLabel}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Search + Grid/List toggle ── */}
      <View style={s.controlBar}>
        <MagnifyingGlass size={15} color="#8A7D6A" weight="regular" />
        <TextInput
          style={s.searchInput}
          placeholder="Search bookmarks"
          placeholderTextColor="#8A7D6A"
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        <View style={s.divider} />
        <TouchableOpacity
          style={viewMode === "grid" ? [s.modeBtn, s.modeBtnActive] : s.modeBtn}
          onPress={() => setViewMode("grid")}
          activeOpacity={0.75}
        >
          <SquaresFour
            size={16}
            color={viewMode === "grid" ? "#1A1410" : "#8A7D6A"}
            weight="regular"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={viewMode === "list" ? [s.modeBtn, s.modeBtnActive] : s.modeBtn}
          onPress={() => setViewMode("list")}
          activeOpacity={0.75}
        >
          <List
            size={16}
            color={viewMode === "list" ? "#1A1410" : "#8A7D6A"}
            weight="regular"
          />
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}

        {filtered.length === 0 ? (
          <View style={s.empty}>
            <BookmarkSimple size={48} color="#DDD5C0" weight="regular" />
            <Text style={s.emptyTitle}>
              {activeFilter === "all" ? "Nothing saved yet" : "No " + (TYPE_CONFIG[activeFilter]?.label || activeFilter) + " bookmarks"}
            </Text>
            <Text style={s.emptyBody}>
              {activeFilter === "all"
                ? "Open any duʿāʾ and tap the heart to start building your collection."
                : "Items you save will appear here."}
            </Text>
            {activeFilter === "all" ? (
              <TouchableOpacity style={s.emptyBtn} onPress={() => navigation?.navigate?.("Duas")} activeOpacity={0.85}>
                <Text style={s.emptyBtnText}>Browse Duʿāʾs</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : viewMode === "grid" ? (
          <View style={s.grid}>
            {filtered.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[s.tile, { backgroundColor: TYPE_CONFIG[item.type]?.color ?? "#3D4A3A" }]}
                onPress={() => handleTileTap(item)}
                activeOpacity={0.85}
              >
                {/* Large background watermark icon */}
                {(() => {
                  const cfg = TYPE_CONFIG[item.type];
                  if (!cfg?.BgIcon) return null;
                  const BgIcon = cfg.BgIcon;
                  return (
                    <View style={s.tileBgIcon} pointerEvents="none">
                      <BgIcon size={110} color="#C8A96A" weight="thin" />
                    </View>
                  );
                })()}

                <View style={s.typeBadge}>
                  <Text style={s.typeBadgeText}>
                    {TYPE_CONFIG[item.type]?.label ?? item.type}
                  </Text>
                </View>

                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.72)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={s.tileGradient}
                />

                <View style={s.tileContent}>
                  <Text style={s.tileTitle} numberOfLines={3}>{item.title}</Text>
                  <View style={s.tileMeta}>
                    <BookmarkSimple size={12} color="rgba(255,255,255,0.7)" weight="fill" />
                    <Text style={s.tileDate}>{formatRelativeDate(item.addedAt)}</Text>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity
                      style={s.tileMenu}
                      onPress={() => handleMenuPress(item)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <DotsThree size={18} color="rgba(255,255,255,0.8)" weight="bold" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={s.listCard}>
            {filtered.map((item, i) => (
              <TouchableOpacity
                key={item.id}
                style={i < filtered.length - 1 ? [s.listRow, s.listRowBorder] : s.listRow}
                onPress={() => handleTileTap(item)}
                activeOpacity={0.85}
              >
                <View style={[s.listIconBox, { backgroundColor: TYPE_CONFIG[item.type]?.color ?? "#3D4A3A" }]}>
                  {getTypeIcon(item.type)}
                </View>
                <View style={s.listInfo}>
                  <Text style={s.listTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={s.listMeta}>
                    {TYPE_CONFIG[item.type]?.label} · {formatRelativeDate(item.addedAt)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleMenuPress(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <DotsThree size={18} color="#C8BFB2" weight="bold" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {null}
      <View style={{ height: 32 }} />

      </ScrollView>

      {/* ── Toast ── */}
      {showToast ? (
        <View style={s.toast}>
          <CheckCircle size={18} color="#4A5C48" weight="fill" />
          <Text style={s.toastText}>{toastMessage}</Text>
          <TouchableOpacity onPress={() => setShowToast(false)}>
            <Text style={s.toastAction}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <AddLinkModal visible={showAddModal} onSave={addLink} onClose={() => setShowAddModal(false)} />
      <EditBookmarkModal
        visible={showEditModal}
        item={editItem}
        onSave={handleEditSave}
        onClose={() => {
          setShowEditModal(false);
          setEditItem(null);
        }}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F0E8" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  headerTitle: {
    fontFamily: "SourceSerif4-Regular",
    fontSize: 22,
    color: colors.text,
    fontWeight: "400",
    textAlign: "center",
  },
  headerSub: {
    fontSize: 12,
    color: colors.subtext,
    marginTop: 2,
    textAlign: "center",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4A5C48",
    alignItems: "center",
    justifyContent: "center",
  },

  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "#DDD5C0",
    backgroundColor: "#FDFAF4",
  },
  filterPillActive: {
    backgroundColor: "#4A5C48",
    borderColor: "#4A5C48",
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5C534A",
  },
  filterLabelActive: {
    color: "#FFFFFF",
  },

  controlBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: "#FDFAF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD5C0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1A1410",
    padding: 0,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "#DDD5C0",
  },
  modeBtn: {
    padding: 6,
    borderRadius: 6,
  },
  modeBtnActive: {
    backgroundColor: "#E8E0D0",
  },

  outer: {
    flex: 1,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 10,
  },
  tile: {
    width: "47%",
    aspectRatio: 0.85,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  tileGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  tileBgIcon: {
    position: "absolute",
    top: -10,
    left: -10,
    opacity: 0.18,
  },
  tileContent: {
    padding: 12,
    gap: 6,
  },
  tileTitle: {
    fontFamily: "SourceSerif4-Regular",
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
    lineHeight: 24,
  },
  tileMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tileDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  typeBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.20)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  tileMenu: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  listCard: {
    backgroundColor: "#FDFAF4",
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: "#2A1F0E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  listRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EDE4D4",
  },
  listIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  listInfo: { flex: 1 },
  listTitle: {
    fontFamily: "SourceSerif4-Regular",
    fontSize: 15,
    color: "#1A1410",
    fontWeight: "500",
  },
  listMeta: {
    fontSize: 12,
    color: "#8A7D6A",
    marginTop: 2,
  },

  empty: {
    alignItems: "center",
    paddingVertical: 56,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: SERIF,
    fontSize: 20,
    color: colors.text,
    textAlign: "center",
  },
  emptyBody: {
    fontSize: 15,
    color: colors.subtext,
    textAlign: "center",
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: "#4A5C48",
    borderRadius: 50,
    paddingHorizontal: 24,
    paddingVertical: 11,
  },
  emptyBtnText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  toast: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#FDFAF4",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#1A1410",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#DDD5C0",
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    color: "#1A1410",
    fontWeight: "500",
  },
  toastAction: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4A5C48",
  },
});
