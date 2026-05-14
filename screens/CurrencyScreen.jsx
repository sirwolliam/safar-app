/**
 * CurrencyScreen.jsx — Safar
 * SAR base currency converter.
 * Fetches live rates when online, falls back to cached rates offline.
 *
 * API: exchangerate-api.com (free tier — 1,500 requests/month)
 * Sign up free at: https://www.exchangerate-api.com
 * Replace YOUR_API_KEY below with your key.
 */
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";
const API_KEY      = "f426059070cfc830eb7109a1";
const API_URL      = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/SAR`;
const CACHE_KEY    = "safar_exchange_rates_v1";
const CACHE_AGE_MS = 6 * 60 * 60 * 1000; // refresh every 6 hours

// Top pilgrim-origin currencies — SAR as base
const CURRENCIES = [
  { code: "GBP", flag: "🇬🇧", name: "British Pound",        country: "United Kingdom" },
  { code: "USD", flag: "🇺🇸", name: "US Dollar",            country: "United States"  },
  { code: "EUR", flag: "🇪🇺", name: "Euro",                 country: "Europe"         },
  { code: "PKR", flag: "🇵🇰", name: "Pakistani Rupee",      country: "Pakistan"       },
  { code: "IDR", flag: "🇮🇩", name: "Indonesian Rupiah",    country: "Indonesia"      },
  { code: "INR", flag: "🇮🇳", name: "Indian Rupee",         country: "India"          },
  { code: "BDT", flag: "🇧🇩", name: "Bangladeshi Taka",     country: "Bangladesh"     },
  { code: "MYR", flag: "🇲🇾", name: "Malaysian Ringgit",    country: "Malaysia"       },
  { code: "EGP", flag: "🇪🇬", name: "Egyptian Pound",       country: "Egypt"          },
  { code: "TRY", flag: "🇹🇷", name: "Turkish Lira",         country: "Turkey"         },
  { code: "NGN", flag: "🇳🇬", name: "Nigerian Naira",       country: "Nigeria"        },
  { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar",      country: "Canada"         },
  { code: "AUD", flag: "🇦🇺", name: "Australian Dollar",    country: "Australia"      },
];

// Fallback rates if API unavailable (approximate — updated at build time)
const FALLBACK_RATES = {
  GBP: 0.211, USD: 0.267, EUR: 0.244, PKR: 74.2,  IDR: 4186,
  INR: 22.3,  BDT: 29.3,  MYR: 1.25,  EGP: 13.1,  TRY: 9.02,
  NGN: 398,   CAD: 0.363, AUD: 0.408,
};

function formatAmount(val, code) {
  if (isNaN(val) || val === 0) return "0";
  if (["IDR","PKR","NGN","BDT","EGP","TRY"].includes(code)) {
    return val >= 1000
      ? val.toLocaleString("en", { maximumFractionDigits: 0 })
      : val.toFixed(2);
  }
  return val < 0.01 ? val.toFixed(6) : val.toFixed(2);
}

export default function CurrencyScreen({ navigation }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [sarAmount, setSarAmount] = useState("100");
  const [rates,     setRates]     = useState(FALLBACK_RATES);
  const [loading,   setLoading]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOffline, setIsOffline]     = useState(false);
  const [selected,  setSelected]  = useState(null); // for reverse conversion
  const [foreignAmount, setForeignAmount] = useState("");

  useEffect(() => { fetchRates(); }, []);

  const fetchRates = async () => {
    // Check cache first
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

    // Fetch live
    if (API_KEY === "YOUR_API_KEY") {
      // No key configured — use fallback silently
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

  // Reverse: convert foreign → SAR
  const handleForeignInput = (text, code) => {
    setForeignAmount(text);
    setSelected(code);
    const fVal = parseFloat(text) || 0;
    const rate = rates[code] || FALLBACK_RATES[code] || 1;
    setSarAmount((fVal / rate).toFixed(2));
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 24 }} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Currency</Text>
        <Text style={s.headerSub}>{"Enter an amount below to convert between Saudi Riyals and your home currency."}</Text>
        <TouchableOpacity onPress={fetchRates} style={s.refreshBtn}>
          {loading
            ? <ActivityIndicator size="small" color={"#1E3D30"} />
            : <Text style={s.refreshIcon}>↺</Text>
          }
        </TouchableOpacity>
      </View>

      {/* SAR input */}
      <View style={s.sarCard}>
        <View style={s.sarLeft}>
          <Text style={s.sarFlag}>🇸🇦</Text>
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

      {/* Status bar */}
      <View style={s.statusRow}>
        {isOffline
          ? <Text style={s.statusOffline}>Using cached rates — connect to update</Text>
          : lastUpdated
            ? <Text style={s.statusOnline}>
                Rates updated {lastUpdated.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
              </Text>
            : <Text style={s.statusOnline}>Live rates</Text>
        }
        {!isOffline && !loading && (
          <TouchableOpacity onPress={fetchRates}>
            <Text style={s.refreshText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Currency list */}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {CURRENCIES.map((currency, i) => {
          const rate       = rates[currency.code] ?? FALLBACK_RATES[currency.code] ?? 1;
          const converted  = sarValue * rate;
          const isSelected = selected === currency.code;

          return (
            <TouchableOpacity
              key={currency.code}
              style={isSelected ? (i === CURRENCIES.length - 1 ? [s.row, s.rowSelected, s.rowLast] : [s.row, s.rowSelected]) : (i === CURRENCIES.length - 1 ? [s.row, s.rowLast] : s.row)}
              onPress={() => setSelected(isSelected ? null : currency.code)}
              activeOpacity={0.85}
            >
              <Text style={s.flag}>{currency.flag}</Text>
              <View style={s.currencyInfo}>
                <Text style={isSelected ? [s.code, s.codeSelected] : s.code}>{currency.code}</Text>
                <Text style={s.currencyName}>{currency.name}</Text>
              </View>
              <View style={s.amountWrap}>
                {isSelected ? (
                  <TextInput
                    style={s.foreignInput}
                    value={foreignAmount}
                    onChangeText={(t) => handleForeignInput(t, currency.code)}
                    keyboardType="decimal-pad"
                    autoFocus
                    selectTextOnFocus
                    placeholder={formatAmount(converted, currency.code)}
                    placeholderTextColor={"#1E3D30"}
                  />
                ) : (
                  <Text style={s.amount}>{formatAmount(converted, currency.code)}</Text>
                )}
                <Text style={s.rateHint}>1 SAR = {formatAmount(rate, currency.code)} {currency.code}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Useful amounts */}
        <View style={s.quickSection}>
          <Text style={s.quickTitle}>Quick reference</Text>
          <View style={s.quickRow}>
            {[10, 50, 100, 500].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={sarAmount === String(amt) ? [s.quickBtn, s.quickBtnActive] : s.quickBtn}
                onPress={() => { setSarAmount(String(amt)); setSelected(null); setForeignAmount(""); }}
              >
                <Text style={sarAmount === String(amt) ? [s.quickBtnText, s.quickBtnTextActive] : s.quickBtnText}>
                  {amt} SAR
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
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#E8DDD0" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  back: { fontSize: 22, color: "#100E0A" },
  headerTitle: { fontFamily: SERIF, fontSize: 22, color: "#100E0A" },
  headerSub:   { fontSize:14, color:"#3A3530", fontWeight:"500", marginTop:4, lineHeight:20 },
  rateTime:    { fontSize:11, color:"#8A7D70", fontWeight:"500", textAlign:"center", marginTop:4 },
  refreshBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  refreshIcon: { fontSize: 22, color: "#1E3D30" },

  sarCard: {
    marginHorizontal: 20, backgroundColor: "#1E3D30", borderRadius: 16,
    padding: 20, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 8, shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:10, elevation:5,
  },
  sarLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sarFlag: { fontSize: 32 },
  sarCode: { fontFamily: SERIF, fontSize: 18, color: "#fff" },
  sarName: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  sarInputWrap: {
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    minWidth: 120, alignItems: "flex-end",
  },
  sarInput: {
    fontFamily: SERIF, fontSize: 28, color: "#fff",
    textAlign: "right", minWidth: 100,
  },

  statusRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, marginBottom: 8,
  },
  statusOffline: { fontSize: 12, color: "#7A6030", fontStyle: "italic" },
  statusOnline:  { fontSize: 12, color: "#5C534A" },
  refreshText:   { fontSize: 12, color: "#1E3D30", fontWeight: "500" },

  scroll: { paddingHorizontal: 20 },

  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#C8BFB2",
  },
  rowSelected: {
    backgroundColor: "#EBF2EE", marginHorizontal: -20,
    paddingHorizontal: 20, borderRadius: 6,
    borderBottomColor: "transparent",
  },
  rowLast: { borderBottomWidth: 0 },
  flag: { fontSize: 28, width: 36, textAlign: "center" },
  currencyInfo: { flex: 1 },
  code: { fontSize: 16, fontWeight: "600", color: "#100E0A" },
  codeSelected: { color: "#1E3D30" },
  currencyName: { fontSize: 12, color: "#5C534A", marginTop: 2 },
  amountWrap: { alignItems: "flex-end", minWidth: 100 },
  amount: { fontFamily: SERIF, fontSize: 18, color: "#100E0A" },
  rateHint: { fontSize: 10, color: "#5C534A", marginTop: 2 },
  foreignInput: {
    fontFamily: SERIF, fontSize: 18, color: "#1E3D30",
    textAlign: "right", minWidth: 100,
    borderBottomWidth: 1.5, borderBottomColor: "#1E3D30",
    paddingBottom: 2,
  },

  quickSection: { marginTop: 20 },
  quickTitle: {
    fontSize: 12, fontWeight: "600", color: "#5C534A",
    letterSpacing: 1, marginBottom: 8,
  },
  quickRow: { flexDirection: "row", gap: 8 },
  quickBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: "#C8BFB2", backgroundColor: "#E8DDD0",
    alignItems: "center", shadowColor:"#4A2E10", shadowOffset:{width:0,height:3}, shadowOpacity:0.20, shadowRadius:10, elevation:5,
  },
  quickBtnActive: { backgroundColor: "#1E3D30", borderColor: "#1E3D30" },
  quickBtnText: { fontSize: 14, color: "#5C534A" },
  quickBtnTextActive: { color: "#fff", fontWeight: "500" },

  disclaimer: {
    fontSize: 12, color: "#5C534A", fontStyle: "italic",
    textAlign: "center", marginTop: 16, lineHeight: 18,
  },
});
