/**
 * AuthScreen.jsx — Safar
 * Email login + registration
 * Email only — no social login, no phone numbers
 */
import React, { useState, useMemo } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { registerUser, loginUser } from "../firebase";
import { colors, spacing, radius, shadows, typography } from "../theme";
import { useAccessibility } from "../AccessibilityContext";

const SERIF = "SourceSerif4-Regular";

export default function AuthScreen({ onAuthenticated }) {
  const { colors } = useAccessibility();
  const s = useMemo(() => createStyles(colors), [colors]);
  const vs = useMemo(() => create_vs(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [mode,     setMode]     = useState("login");   // login | register
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [name,     setName]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  const clearError = () => setError("");

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await registerUser(email.trim(), password, name.trim());
        setVerificationSent(true);
      } else {
        const user = await loginUser(email.trim(), password);
        if (!user.emailVerified) {
          setError("Please verify your email before signing in. Check your inbox.");
          return;
        }
        onAuthenticated?.(user);
      }
    } catch (e) {
      const msg = e.code === "auth/user-not-found"    ? "No account found with this email."
                : e.code === "auth/wrong-password"    ? "Incorrect password."
                : e.code === "auth/email-already-in-use" ? "An account with this email already exists."
                : e.code === "auth/invalid-email"     ? "Please enter a valid email address."
                : e.code === "auth/weak-password"     ? "Password must be at least 8 characters."
                : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Verification sent screen
  if (verificationSent) {
    return (
      <View style={[vs.safe, { paddingTop: insets.top + spacing(4) }]}>
        <Text style={vs.emoji}>📬</Text>
        <Text style={vs.title}>Check your email</Text>
        <Text style={vs.body}>
          We sent a verification link to{"\n"}
          <Text style={vs.email}>{email}</Text>
          {"\n\n"}Click the link to verify your account, then come back and sign in.
        </Text>
        <TouchableOpacity style={vs.btn} onPress={() => { setMode("login"); setVerificationSent(false); }}>
          <Text style={vs.btnText}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + spacing(4), paddingBottom: insets.bottom + spacing(3) }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.appName}>Safar</Text>
          <Text style={s.tagline}>Your Journey, Step by Step</Text>
        </View>

        {/* Card */}
        <View style={s.card}>
          {/* Mode toggle */}
          <View style={s.modeToggle}>
            {[["login", "Sign In"], ["register", "Create Account"]].map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[s.modeOpt, mode === key && s.modeOptActive]}
                onPress={() => { setMode(key); clearError(); }}
                activeOpacity={0.8}
              >
                <Text style={[s.modeLabel, mode === key && s.modeLabelActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Fields */}
          {mode === "register" && (
            <View style={s.field}>
              <Text style={s.fieldLabel}>Your name</Text>
              <TextInput
                style={s.input}
                placeholder="Fatima Al-Hassan"
                placeholderTextColor={colors.placeholder}
                value={name}
                onChangeText={(t) => { setName(t); clearError(); }}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          )}

          <View style={s.field}>
            <Text style={s.fieldLabel}>Email address</Text>
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={(t) => { setEmail(t); clearError(); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={s.field}>
            <Text style={s.fieldLabel}>Password</Text>
            <TextInput
              style={s.input}
              placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={(t) => { setPassword(t); clearError(); }}
              secureTextEntry
            />
          </View>

          {/* Error */}
          {error ? <Text style={s.error}>{error}</Text> : null}

          {/* Submit */}
          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} activeOpacity={0.88} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.submitBtnText}>{mode === "login" ? "Sign In" : "Create Account"}</Text>
            }
          </TouchableOpacity>

          {/* Privacy note */}
          <Text style={s.privacyNote}>
            Safar uses email-only authentication.{"\n"}
            Your data is never shared with third parties.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Verification screen styles ────────────────────────────────────────────────
const create_vs = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, alignItems: "center", paddingHorizontal: spacing(3) },
  emoji: { fontSize: 48, marginBottom: spacing(2) },
  title: { fontFamily: SERIF, fontSize: 26, color: colors.text, marginBottom: spacing(1.5), textAlign: "center" },
  body: { fontSize: typography.body, color: colors.subtext, textAlign: "center", lineHeight: 24 },
  email: { color: colors.primary, fontWeight: "500" },
  btn: {
    marginTop: spacing(3), backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: spacing(1.75), paddingHorizontal: spacing(4), ...shadows.button,
  },
  btnText: { color: "#fff", fontWeight: "500", fontSize: typography.body },
});

const createStyles = (colors) => StyleSheet.create({
  scroll: { paddingHorizontal: spacing(2.5) },

  header: { alignItems: "center", marginBottom: spacing(3) },
  appName: { fontFamily: SERIF, fontSize: 36, color: colors.text, lineHeight: 42 },
  tagline: { fontSize: typography.small, color: colors.primary, marginTop: 4 },

  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.border, padding: spacing(2.5), ...shadows.md,
  },

  modeToggle: {
    flexDirection: "row", backgroundColor: colors.background, borderRadius: radius.pill,
    padding: 3, borderWidth: 1, borderColor: colors.border, marginBottom: spacing(2.5),
  },
  modeOpt: { flex: 1, paddingVertical: spacing(1.25), borderRadius: radius.pill, alignItems: "center" },
  modeOptActive: { backgroundColor: colors.primary },
  modeLabel: { fontSize: typography.small, color: colors.subtext },
  modeLabelActive: { color: "#fff", fontWeight: "500" },

  field: { marginBottom: spacing(2) },
  fieldLabel: { fontSize: typography.small, color: colors.text, fontWeight: "500", marginBottom: spacing(0.75) },
  input: {
    backgroundColor: colors.background, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, paddingHorizontal: spacing(2), paddingVertical: spacing(1.5),
    fontSize: typography.body, color: colors.text,
  },

  error: {
    fontSize: typography.small, color: colors.error,
    backgroundColor: "#FFF0F0", borderRadius: radius.sm, padding: spacing(1.25),
    marginBottom: spacing(1.5), textAlign: "center",
  },

  submitBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: spacing(1.75), alignItems: "center", ...shadows.button, marginBottom: spacing(2),
  },
  submitBtnText: { color: "#fff", fontWeight: "500", fontSize: typography.body },

  privacyNote: {
    fontSize: typography.tiny, color: colors.subtext,
    textAlign: "center", lineHeight: 18,
  },
});
