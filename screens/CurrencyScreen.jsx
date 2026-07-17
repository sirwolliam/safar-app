import React, { useState, useEffect, useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, StatusBar, Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgXml } from "react-native-svg";
import { ArrowLeft, ArrowsClockwise } from "phosphor-react-native";
import HeaderPatternBg from "../HeaderPatternBg";
import { FLAGS } from "../flagAssets";

const SERIF = "SourceSerif4-Regular";
const SW    = Dimensions.get("window").width;

const CURRENCIES = [
  { code: "GBP", name: "British Pound",     country: "United Kingdom" },
  { code: "USD", name: "US Dollar",         country: "United States"  },
  { code: "EUR", name: "Euro",              country: "Europe"         },
  { code: "PKR", name: "Pakistani Rupee",   country: "Pakistan"       },
  { code: "IDR", name: "Indonesian Rupiah", country: "Indonesia"      },
  { code: "INR", name: "Indian Rupee",      country: "India"          },
  { code: "BDT", name: "Bangladeshi Taka",  country: "Bangladesh"     },
  { code: "MYR", name: "Malaysian Ringgit", country: "Malaysia"       },
  { code: "EGP", name: "Egyptian Pound",    country: "Egypt"          },
  { code: "TRY", name: "Turkish Lira",      country: "Turkey"         },
  { code: "NGN", name: "Nigerian Naira",    country: "Nigeria"        },
  { code: "CAD", name: "Canadian Dollar",   country: "Canada"         },
  { code: "AUD", name: "Australian Dollar", country: "Australia"      },
];

const FALLBACK_RATES = {
  GBP: 0.211, USD: 0.267, EUR: 0.244, PKR: 74.2,  IDR: 4186,
  INR: 22.3,  BDT: 29.3,  MYR: 1.25,  EGP: 13.1,  TRY: 9.02,
  NGN: 398,   CAD: 0.363, AUD: 0.408,
};

const API_KEY      = "f426059070cfc830eb7109a1";
const API_URL      = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/SAR`;
const CACHE_KEY    = "safar_exchange_rates_v1";
const CACHE_AGE_MS = 6 * 60 * 60 * 1000;

function formatAmount(val, code) {
  if (isNaN(val) || val === 0) return "0";
  if (["IDR", "PKR", "NGN", "BDT", "EGP", "TRY"].includes(code)) {
    return val >= 1000
      ? val.toLocaleString("en", { maximumFractionDigits: 0 })
      : val.toFixed(2);
  }
  return val < 0.01 ? val.toFixed(6) : val.toFixed(2);
}

export default function CurrencyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [sarAmount,     setSarAmount]     = useState("100");
  const [rates,         setRates]         = useState(FALLBACK_RATES);
  const [loading,       setLoading]       = useState(false);
  const [lastUpdated,   setLastUpdated]   = useState(null);
  const [isOffline,     setIsOffline]     = useState(false);
  const [selected,      setSelected]      = useState(null);
  const [foreignAmount, setForeignAmount] = useState("");

  useEffect(() => { fetchRates(); }, []);

  const fetchRates = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const { rates: cachedRates, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < CACHE_AGE_MS) {
          setRates(cachedRates);
          setLastUpdated(new Date(timestamp));
          return;
        }
      }
    } catch {}

    if (API_KEY === "YOUR_API_KEY") {
      setIsOffline(true);
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(API_URL);
      const data = await res.json();
      if (data.result === "success") {
        const r = data.conversion_rates;
        const filtered = {};
        CURRENCIES.forEach(({ code }) => { if (r[code]) filtered[code] = r[code]; });
        setRates(filtered);
        setLastUpdated(new Date());
        setIsOffline(false);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
          rates: filtered, timestamp: Date.now(),
        }));
      }
    } catch {
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const sarValue = parseFloat(sarAmount) || 0;

  const handleForeignInput = (text, code) => {
    setForeignAmount(text);
    setSelected(code);
    const fVal = parseFloat(text) || 0;
    const rate = rates[code] || FALLBACK_RATES[code] || 1;
    setSarAmount((fVal / rate).toFixed(2));
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />

      <View style={s.header}>
        <HeaderPatternBg width={SW} />
        <View style={[s.headerTopRow, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={s.chipBtn} onPress={() => navigation?.goBack?.()}>
            <ArrowLeft size={20} color="#1A1410" weight="regular" />
          </TouchableOpacity>
          <TouchableOpacity style={s.chipBtn} onPress={fetchRates}>
            {loading
              ? <ActivityIndicator size="small" color="#1A1410" />
              : <ArrowsClockwise size={20} color="#1A1410" weight="regular" />}
          </TouchableOpacity>
        </View>
        <Text style={s.pageTitle}>Currency</Text>
      </View>

      <Text style={s.intro}>
        Enter an amount to convert between Saudi Riyals and your home currency.
      </Text>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* SAR input card */}
        <View style={s.sarCard}>
          <View style={s.sarLeft}>
            <View style={s.flagWrap}>
              <SvgXml xml={FLAGS.SAR} width={32} height={24} />
            </View>
            <View>
              <Text style={s.sarCode}>SAR</Text>
              <Text style={s.sarName}>Saudi Riyal</Text>
            </View>
          </View>
          <View style={s.sarInputWrap}>
            <TextInput
              style={s.sarInput}
              value={sarAmount}
              onChangeText={(t) => { setSarAmount(t); setSelected(null); setForeignAmount(""); }}
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
          </View>
        </View>

        {/* Status row */}
        <View style={s.statusRow}>
          {isOffline
            ? <Text style={s.statusOffline}>Using cached rates — connect to update</Text>
            : lastUpdated
              ? <Text style={s.statusOnline}>
                  {"Rates updated " + lastUpdated.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                </Text>
              : <Text style={s.statusOnline}>Live rates</Text>}
          {!isOffline && !loading
            ? <TouchableOpacity onPress={fetchRates}>
                <Text style={s.refreshText}>Refresh</Text>
              </TouchableOpacity>
            : null}
        </View>

        {/* Currency list */}
        {CURRENCIES.map((currency) => (
          <TouchableOpacity
            key={currency.code}
            style={selected === currency.code ? [s.row, s.rowSelected] : s.row}
            activeOpacity={0.75}
            onPress={() => {
              setSelected(selected === currency.code ? null : currency.code);
              setForeignAmount("");
            }}
          >
            <View style={s.flagWrap}>
              {FLAGS[currency.code]
                ? <SvgXml xml={FLAGS[currency.code]} width={32} height={24} />
                : null}
            </View>
            <View style={s.rowInfo}>
              <Text style={s.code}>{currency.code}</Text>
              <Text style={s.rowSub}>{currency.name}</Text>
            </View>
            <View style={s.amountWrap}>
              {selected === currency.code
                ? <TextInput
                    style={s.foreignInput}
                    value={foreignAmount}
                    onChangeText={(t) => handleForeignInput(t, currency.code)}
                    keyboardType="decimal-pad"
                    autoFocus
                    selectTextOnFocus
                    placeholder={formatAmount(sarValue * (rates[currency.code] ?? FALLBACK_RATES[currency.code] ?? 1), currency.code)}
                    placeholderTextColor="#8A7D6A"
                  />
                : <Text style={s.amount}>
                    {formatAmount(sarValue * (rates[currency.code] ?? FALLBACK_RATES[currency.code] ?? 1), currency.code)}
                  </Text>}
              <Text style={s.rateHint}>
                {"1 SAR = " + formatAmount(rates[currency.code] ?? FALLBACK_RATES[currency.code] ?? 1, currency.code) + " " + currency.code}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Quick reference */}
        <View style={s.quickSection}>
          <Text style={s.quickTitle}>QUICK REFERENCE</Text>
          <View style={s.quickRow}>
            {[10, 50, 100, 500].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={sarAmount === String(amt) ? [s.quickBtn, s.quickBtnActive] : s.quickBtn}
                onPress={() => { setSarAmount(String(amt)); setSelected(null); setForeignAmount(""); }}
              >
                <Text style={sarAmount === String(amt) ? [s.quickBtnText, s.quickBtnTextActive] : s.quickBtnText}>
                  {amt + " SAR"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={s.disclaimer}>
          Exchange rates are for reference only. Actual rates vary by provider. Always check with your bank or exchange bureau.
        </Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:             { flex: 1, backgroundColor: "#F5F0E8" },
  header:           { backgroundColor: "#4A5C48", position: "relative", overflow: "hidden", minHeight: 140, paddingHorizontal: 16, paddingBottom: 16 },
  headerTopRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 2 },
  chipBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FDFAF4", alignItems: "center", justifyContent: "center" },
  pageTitle:        { fontFamily: SERIF, fontSize: 38, color: "#FDFAF4", textAlign: "center", marginTop: 8, position: "relative", zIndex: 2 },
  intro:            { fontSize: 14, color: "#5C534A", lineHeight: 20, textAlign: "center", paddingHorizontal: 24, marginTop: 10, marginBottom: 16 },
  scroll:           { flex: 1 },
  scrollContent:    { paddingBottom: 24 },
  sarCard:          { marginHorizontal: 16, backgroundColor: "#4A5C48", borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  sarLeft:          { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  sarCode:          { fontFamily: SERIF, fontSize: 18, color: "#FFFFFF" },
  sarName:          { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  sarInputWrap:     { backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, minWidth: 120, alignItems: "flex-end" },
  sarInput:         { fontFamily: SERIF, fontSize: 28, color: "#FFFFFF", textAlign: "right", minWidth: 100, padding: 0 },
  statusRow:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 12 },
  statusOffline:    { fontSize: 12, color: "#7A6030", fontStyle: "italic" },
  statusOnline:     { fontSize: 12, color: "#5C534A" },
  refreshText:      { fontSize: 12, color: "#4A5C48", fontWeight: "500" },
  row:              { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 16, backgroundColor: "#FDFAF4", borderRadius: 16, marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: "#EDE4D4", shadowColor: "#2A1F0E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, gap: 14 },
  rowSelected:      { borderColor: "#4A5C48", borderWidth: 1.5, backgroundColor: "#F3F5F0" },
  flagWrap:         { width: 36, height: 26, borderRadius: 4, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "#EDE4D4" },
  rowInfo:          { flex: 1 },
  code:             { fontSize: 19, color: "#1C1A14" },
  rowSub:           { fontSize: 13, color: "#5C534A", marginTop: 2 },
  amountWrap:       { alignItems: "flex-end", minWidth: 100 },
  amount:           { fontFamily: SERIF, fontSize: 18, color: "#1A1410" },
  rateHint:         { fontSize: 10, color: "#8A7D6A", marginTop: 2 },
  foreignInput:     { fontFamily: SERIF, fontSize: 18, color: "#4A5C48", textAlign: "right", minWidth: 100, borderBottomWidth: 1.5, borderBottomColor: "#4A5C48", paddingBottom: 2, padding: 0 },
  quickSection:     { marginTop: 8, marginHorizontal: 16, marginBottom: 16 },
  quickTitle:       { fontSize: 11, fontWeight: "700", color: "#8A7D6A", letterSpacing: 1.2, marginBottom: 10 },
  quickRow:         { flexDirection: "row", gap: 8 },
  quickBtn:         { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#DDD5C0", backgroundColor: "#FDFAF4", alignItems: "center" },
  quickBtnActive:   { backgroundColor: "#4A5C48", borderColor: "#4A5C48" },
  quickBtnText:     { fontSize: 14, color: "#5C534A", fontWeight: "500" },
  quickBtnTextActive: { color: "#FFFFFF", fontWeight: "600" },
  disclaimer:       { fontSize: 12, color: "#8A7D6A", fontStyle: "italic", textAlign: "center", marginHorizontal: 24, marginTop: 8, lineHeight: 18 },
});
