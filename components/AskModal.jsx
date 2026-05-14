/**
 * AskModal.jsx — Safar
 * AI assistant half-sheet:
 * - Taller sheet (minHeight 520)
 * - Sage green header band with "Ask Safar" centered + dua label below
 * - No bullet point on suggestions
 * - Suggestion text 16pt (accessibility minimum)
 * - Full sentences, no forced line breaks
 * - answerScroll maxHeight increased so all suggestions visible without scrolling
 */
import React, { useState, useRef } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from "react-native";
import Svg, { Path, Line } from "react-native-svg";

const SERIF     = "SourceSerif4-Regular";
const SAGE      = "#4A5C48";   // matches DuaDetailScreen CTRL_BG exactly
const GOLD      = "#B8922A";
const PARCHMENT = "#FDFAF4";
const DARK_TEXT = "#2A2218";

const SUGGESTIONS = [
  "When exactly do I say this du\u02bf\u0101\u02be?",
  "What does this mean and why is it important?",
  "Is there a shorter version I can use?",
  "Does the ruling differ between madhabs?",
  "What if I forget to say this during the rite?",
];

function SendIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke={PARCHMENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function MicIcon({ active }) {
  const c = active ? GOLD : "#8A9E88";
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"
        stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"
        stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function CloseIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12"
        stroke="rgba(232,224,208,0.80)" strokeWidth="1.8" strokeLinecap="round"/>
    </Svg>
  );
}

function buildSystemPrompt(context) {
  return `You are Safar's AI guide — a knowledgeable, calm and scholarly assistant for Hajj and Umrah pilgrims.

Context the user is viewing:
${context}

Answer the user's question concisely and accurately. Always:
- Ground answers in authentic Islamic scholarship (cite hadith or Quran where relevant)
- Note if rulings differ between the four madhabs (Hanafi, Maliki, Shafi'i, Hanbali)
- Keep answers to 2-4 sentences unless more detail is truly needed
- Use a warm, encouraging tone appropriate for someone on a sacred journey
- If unsure, recommend consulting a qualified scholar

Do not make up citations. If you don't know something, say so clearly.`;
}

export default function AskModal({ visible, onClose, context, contextLabel }) {
  const [question,  setQuestion]  = useState("");
  const [answer,    setAnswer]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [listening, setListening] = useState(false);
  const inputRef = useRef(null);

  const reset = () => {
    setQuestion(""); setAnswer(null); setError(null); setListening(false);
  };
  const handleClose = () => { reset(); onClose(); };

  const askClaude = async (q) => {
    if (!q.trim()) return;
    setLoading(true); setAnswer(null); setError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system: buildSystemPrompt(context),
          messages:[{ role:"user", content:q.trim() }],
        }),
      });
      const data = await res.json();
      const text = data?.content?.find(b => b.type === "text")?.text;
      setAnswer(text ?? "No response received. Please try again.");
    } catch (_) {
      setError("Couldn\u2019t connect. Check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = async () => {
    let SR;
    try { SR = require("expo-speech-recognition"); } catch (_) {}
    if (!SR) { inputRef.current?.focus(); return; }
    if (listening) { SR.ExpoSpeechRecognitionModule?.stopListening?.(); setListening(false); return; }
    try {
      setListening(true);
      const r = await SR.ExpoSpeechRecognitionModule?.startListeningAsync?.({ lang:"en-US", interimResults:false });
      if (r?.value) setQuestion(r.value);
    } catch (_) { inputRef.current?.focus(); }
    finally { setListening(false); }
  };

  const canSend = question.trim().length > 0 && !loading;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableOpacity style={m.backdrop} activeOpacity={1} onPress={handleClose} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={m.container}>
        <View style={m.sheet}>

          {/* Handle */}
          <View style={m.handle} />

          {/* ── Sage green header band ── */}
          <View style={m.header}>
            {/* Close button top-right */}
            <TouchableOpacity style={m.closeBtn} onPress={handleClose} activeOpacity={0.8}>
              <CloseIcon />
            </TouchableOpacity>

            {/* "Ask Safar" centered */}
            <Text style={m.headerTitle}>Ask Safar</Text>

            {/* Dua label below title */}
            {contextLabel ? (
              <Text style={m.headerSub} numberOfLines={2}>{contextLabel}</Text>
            ) : null}
          </View>

          {/* Gold divider */}
          <View style={m.goldLine} />

          {/* Content — no scroll needed for suggestions */}
          <View style={m.content}>

            {!answer && !loading && !error && (
              <View style={m.emptyState}>
                {SUGGESTIONS.map(q => (
                  <TouchableOpacity
                    key={q}
                    style={m.suggestion}
                    onPress={() => { setQuestion(q); askClaude(q); }}
                    activeOpacity={0.8}
                  >
                    <Text style={m.suggestionTxt}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {loading && (
              <View style={m.loadingWrap}>
                <ActivityIndicator color={SAGE} size="small" />
                <Text style={m.loadingTxt}>Consulting Safar\u2026</Text>
              </View>
            )}

            {error && (
              <View style={m.errorWrap}>
                <Text style={m.errorTxt}>{error}</Text>
              </View>
            )}

            {answer && !loading && (
              <ScrollView style={m.answerScroll} showsVerticalScrollIndicator={false}>
                <View style={m.answerMeta}>
                  <View style={m.aiDot} />
                  <Text style={m.answerMetaTxt}>Safar</Text>
                </View>
                <Text style={m.answerTxt}>{answer}</Text>
                <TouchableOpacity style={m.askAgainBtn} onPress={reset} activeOpacity={0.8}>
                  <Text style={m.askAgainTxt}>Ask another question</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>

          {/* Input row */}
          <View style={m.inputRow}>
            <TouchableOpacity
              style={[m.micBtn, listening ? m.micBtnActive : null]}
              onPress={toggleVoice} activeOpacity={0.8}
            >
              <MicIcon active={listening} />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              style={m.input}
              placeholder={listening ? "Listening\u2026" : "Type your question\u2026"}
              placeholderTextColor="#8A7D70"
              value={question}
              onChangeText={setQuestion}
              onSubmitEditing={() => askClaude(question)}
              returnKeyType="send"
              multiline={false}
              editable={!listening}
            />

            <TouchableOpacity
              style={[m.sendBtn, canSend ? null : m.sendBtnOff]}
              onPress={() => askClaude(question)}
              disabled={!canSend}
              activeOpacity={0.85}
            >
              <SendIcon />
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const m = StyleSheet.create({

  backdrop:  { flex:1, backgroundColor:"rgba(10,20,14,0.50)" },
  container: { position:"absolute", bottom:0, left:0, right:0 },

  sheet: {
    backgroundColor:PARCHMENT,
    borderTopLeftRadius:24,
    borderTopRightRadius:24,
    minHeight:520,
    maxHeight:"88%",
    shadowColor:"#000",
    shadowOffset:{width:0,height:-4},
    shadowOpacity:0.18,
    shadowRadius:16,
    elevation:14,
  },

  handle: {
    width:36, height:4, borderRadius:2,
    backgroundColor:"rgba(232,224,208,0.60)",
    alignSelf:"center",
    marginTop:10, marginBottom:0,
  },

  // Sage green header — same colour as DuaDetailScreen footer
  header: {
    backgroundColor:SAGE,
    borderTopLeftRadius:20,
    borderTopRightRadius:20,
    paddingTop:14,
    paddingBottom:16,
    paddingHorizontal:20,
    alignItems:"center",
  },
  closeBtn: {
    position:"absolute",
    top:12, right:14,
    width:32, height:32,
    borderRadius:16,
    backgroundColor:"rgba(232,224,208,0.12)",
    alignItems:"center",
    justifyContent:"center",
  },
  headerTitle: {
    fontFamily:SERIF,
    fontSize:18,
    fontWeight:"600",
    color:PARCHMENT,
    textAlign:"center",
    marginBottom:4,
  },
  headerSub: {
    fontSize:13,
    color:"rgba(232,224,208,0.72)",
    textAlign:"center",
    lineHeight:19,
    maxWidth:280,
  },

  goldLine: {
    height:1,
    backgroundColor:GOLD,
    marginHorizontal:20,
    opacity:0.40,
    marginTop:0,
  },

  // Content area — fixed, no scroll, tall enough for all suggestions
  content: {
    flex:1,
    paddingHorizontal:20,
    paddingTop:16,
    paddingBottom:8,
  },

  emptyState: {
    gap:10,
  },

  // Suggestions — no bullet, full sentence, min 16pt for accessibility
  suggestion: {
    paddingVertical:14,
    paddingHorizontal:18,
    backgroundColor:"#F0EAE0",
    borderRadius:12,
    borderWidth:1,
    borderColor:"#E0D8CC",
  },
  suggestionTxt: {
    fontSize:16,
    color:SAGE,
    fontWeight:"500",
    lineHeight:22,
    // Keep sentences together
    flexShrink:1,
  },

  loadingWrap: {
    flexDirection:"row", alignItems:"center",
    gap:12, paddingVertical:24, justifyContent:"center",
  },
  loadingTxt: { fontSize:15, color:"#8A7D70", fontStyle:"italic" },

  errorWrap: { backgroundColor:"#FFF0F0", borderRadius:10, padding:14 },
  errorTxt:  { fontSize:15, color:"#C0392B", lineHeight:22 },

  answerScroll: { flex:1 },
  answerMeta: {
    flexDirection:"row", alignItems:"center",
    gap:8, marginBottom:10,
  },
  aiDot:        { width:8, height:8, borderRadius:4, backgroundColor:SAGE },
  answerMetaTxt:{ fontSize:12, color:SAGE, fontWeight:"700", letterSpacing:0.5 },
  answerTxt:    { fontSize:16, color:DARK_TEXT, lineHeight:26, fontWeight:"400" },
  askAgainBtn: {
    marginTop:16, alignSelf:"flex-start",
    paddingVertical:9, paddingHorizontal:16,
    backgroundColor:"#F0EAE0", borderRadius:50,
    borderWidth:1, borderColor:"#C8BFB2",
  },
  askAgainTxt: { fontSize:14, color:SAGE, fontWeight:"600" },

  inputRow: {
    flexDirection:"row", alignItems:"center",
    paddingHorizontal:14, paddingVertical:12,
    gap:8,
    borderTopWidth:1, borderTopColor:"#E8E0D4",
    backgroundColor:PARCHMENT,
  },

  micBtn: {
    width:40, height:40, borderRadius:20,
    backgroundColor:"#F0EAE0",
    borderWidth:1, borderColor:"#C8BFB2",
    alignItems:"center", justifyContent:"center",
  },
  micBtnActive: { backgroundColor:"rgba(184,146,42,0.15)", borderColor:GOLD },

  input: {
    flex:1, fontSize:16, color:DARK_TEXT,
    paddingVertical:9, paddingHorizontal:14,
    backgroundColor:"#F5EDE0",
    borderRadius:22, borderWidth:1, borderColor:"#C8BFB2",
  },

  sendBtn:    { width:40, height:40, borderRadius:20, backgroundColor:SAGE, alignItems:"center", justifyContent:"center" },
  sendBtnOff: { backgroundColor:"#C8BFB2" },
});
