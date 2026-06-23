/**
 * AskModal.jsx — Safar
 * Shared half-sheet AI assistant modal.
 * Used by GuideCarousel ("Ask about this step") and DuaDetailScreen ("Ask about this du'ā").
 * Accepts a context string describing what the user is looking at.
 * User types or speaks a question → Claude answers with scholarly context.
 */
import React, { useState, useRef } from "react";
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView,
  Platform, ActivityIndicator, Animated,
} from "react-native";
import Svg, { Path, Line } from "react-native-svg";

const SERIF   = "#SourceSerif4-Regular";
const GREEN   = "#1E3D30";
const GOLD    = "#B8922A";
const PARCHMENT = "#FDFAF4";

// ── SVG icons ─────────────────────────────────────────────────────────────────
function SendIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke={PARCHMENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function MicIcon({ active }) {
  const c = active ? GOLD : "#5C534A";
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
        stroke="#5C534A" strokeWidth="1.8" strokeLinecap="round"/>
    </Svg>
  );
}

// ── System prompt builder ─────────────────────────────────────────────────────
function buildSystemPrompt(context) {
  return `You are Safar's AI guide — a knowledgeable, calm and scholarly assistant for Hajj and Umrah pilgrims.

Context the user is viewing:
${context}

Answer the user's question concisely and accurately. Always:
- Ground answers in authentic Islamic scholarship (cite hadith or Quran where relevant)
- Note if rulings differ between the four madhabs (Hanafi, Maliki, Shafi'i, Hanbali)
- Keep answers brief — 2-4 sentences unless the question requires more detail
- Use a warm, encouraging tone appropriate for someone on a sacred journey
- If unsure, recommend consulting a qualified scholar

Do not make up citations. If you don't know something, say so clearly.`;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AskModal({ visible, onClose, context, contextLabel }) {
  const [question,  setQuestion]  = useState("");
  const [answer,    setAnswer]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [listening, setListening] = useState(false);
  const inputRef = useRef(null);

  const reset = () => {
    setQuestion("");
    setAnswer(null);
    setError(null);
    setListening(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const askClaude = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setAnswer(null);
    setError(null);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildSystemPrompt(context),
          messages: [{ role: "user", content: q.trim() }],
        }),
      });

      const data = await res.json();
      const text = data?.content?.find(b => b.type === "text")?.text;
      if (text) {
        setAnswer(text);
      } else {
        setError("No response received. Please try again.");
      }
    } catch (err) {
      setError("Couldn't connect. Check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Voice input — uses expo-speech-recognition if available, graceful fallback
  const toggleVoice = async () => {
    let SpeechRecognition;
    try { SpeechRecognition = require("expo-speech-recognition"); } catch (_) {}

    if (!SpeechRecognition) {
      // Graceful fallback — focus the text input
      inputRef.current?.focus();
      return;
    }

    if (listening) {
      SpeechRecognition.ExpoSpeechRecognitionModule?.stopListening?.();
      setListening(false);
      return;
    }

    try {
      setListening(true);
      const result = await SpeechRecognition.ExpoSpeechRecognitionModule?.startListeningAsync?.({
        lang: "en-US",
        interimResults: false,
      });
      if (result?.value) {
        setQuestion(result.value);
      }
    } catch (_) {
      // Fallback silently — just focus text input
      inputRef.current?.focus();
    } finally {
      setListening(false);
    }
  };

  const canSend = question.trim().length > 0 && !loading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity style={m.backdrop} activeOpacity={1} onPress={handleClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={m.container}
      >
        <View style={m.sheet}>

          {/* Handle bar */}
          <View style={m.handle} />

          {/* Header */}
          <View style={m.header}>
            <View style={m.headerLeft}>
              <View style={m.aiDot} />
              <View>
                <Text style={m.headerTitle}>Ask Safar</Text>
                {contextLabel ? (
                  <Text style={m.headerSub} numberOfLines={1}>{contextLabel}</Text>
                ) : null}
              </View>
            </View>
            <TouchableOpacity style={m.closeBtn} onPress={handleClose} activeOpacity={0.8}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* Gold divider */}
          <View style={m.goldLine} />

          {/* Answer area */}
          <ScrollView
            style={m.answerScroll}
            contentContainerStyle={m.answerContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {!answer && !loading && !error && (
              <View style={m.emptyState}>
                <Text style={m.emptyTitle}>{"Ask anything about this"}</Text>
                <Text style={m.emptySub}>
                  {"When to say it · Ruling differences · Meaning · History · What to do if you forget"}
                </Text>

                {/* Suggested questions */}
                {[
                  "When exactly do I say this?",
                  "Is there a shorter version?",
                  "Does the ruling differ between madhabs?",
                ].map(q => (
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
                <ActivityIndicator color={GREEN} size="small" />
                <Text style={m.loadingTxt}>Consulting Safar…</Text>
              </View>
            )}

            {error && (
              <View style={m.errorWrap}>
                <Text style={m.errorTxt}>{error}</Text>
              </View>
            )}

            {answer && !loading && (
              <View style={m.answerWrap}>
                <View style={m.answerMeta}>
                  <View style={m.aiDotSmall} />
                  <Text style={m.answerMetaTxt}>Safar</Text>
                </View>
                <Text style={m.answerTxt}>{answer}</Text>
                <TouchableOpacity style={m.askAgainBtn} onPress={reset} activeOpacity={0.8}>
                  <Text style={m.askAgainTxt}>Ask another question</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Input row */}
          <View style={m.inputRow}>
            <TouchableOpacity
              style={[m.micBtn, listening ? m.micBtnActive : null]}
              onPress={toggleVoice}
              activeOpacity={0.8}
            >
              <MicIcon active={listening} />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              style={m.input}
              placeholder={listening ? "Listening…" : "Type your question…"}
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

// ── Styles ────────────────────────────────────────────────────────────────────
const m = StyleSheet.create({

  backdrop: {
    flex:1,
    backgroundColor:"rgba(10,20,14,0.45)",
  },

  container: {
    position:"absolute",
    bottom:0,
    left:0,
    right:0,
  },

  sheet: {
    backgroundColor:PARCHMENT,
    borderTopLeftRadius:24,
    borderTopRightRadius:24,
    minHeight:360,
    maxHeight:"80%",
    shadowColor:"#000",
    shadowOffset:{width:0,height:-4},
    shadowOpacity:0.14,
    shadowRadius:16,
    elevation:12,
  },

  handle: {
    width:36,
    height:4,
    borderRadius:2,
    backgroundColor:"#C8BFB2",
    alignSelf:"center",
    marginTop:10,
    marginBottom:4,
  },

  header: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    paddingHorizontal:20,
    paddingVertical:14,
  },
  headerLeft: {
    flexDirection:"row",
    alignItems:"center",
    gap:10,
  },
  aiDot: {
    width:10,
    height:10,
    borderRadius:5,
    backgroundColor:GREEN,
  },
  headerTitle: {
    fontFamily:"SourceSerif4-Regular",
    fontSize:17,
    fontWeight:"600",
    color:GREEN,
  },
  headerSub: {
    fontSize:12,
    color:"#8A7D70",
    marginTop:1,
    maxWidth:220,
  },
  closeBtn: {
    width:32,
    height:32,
    borderRadius:16,
    backgroundColor:"#F0EAE0",
    alignItems:"center",
    justifyContent:"center",
  },

  goldLine: {
    height:1,
    backgroundColor:GOLD,
    marginHorizontal:20,
    opacity:0.35,
  },

  // Answer area
  answerScroll: {
    flexGrow:0,
    maxHeight:280,
  },
  answerContent: {
    padding:20,
    paddingBottom:8,
  },

  emptyState: {
    alignItems:"center",
    paddingVertical:8,
  },
  emptyTitle: {
    fontFamily:"SourceSerif4-Regular",
    fontSize:16,
    color:"#2A2218",
    fontWeight:"600",
    marginBottom:6,
    textAlign:"center",
  },
  emptySub: {
    fontSize:13,
    color:"#8A7D70",
    textAlign:"center",
    lineHeight:20,
    marginBottom:18,
  },
  suggestion: {
    alignSelf:"stretch",
    paddingVertical:11,
    paddingHorizontal:16,
    backgroundColor:"#F0EAE0",
    borderRadius:10,
    marginBottom:8,
    borderWidth:1,
    borderColor:"#E0D8CC",
  },
  suggestionTxt: {
    fontSize:14,
    color:"#1E3D30",
    fontWeight:"500",
  },

  loadingWrap: {
    flexDirection:"row",
    alignItems:"center",
    gap:12,
    paddingVertical:20,
    justifyContent:"center",
  },
  loadingTxt: {
    fontSize:14,
    color:"#8A7D70",
    fontStyle:"italic",
  },

  errorWrap: {
    backgroundColor:"#FFF0F0",
    borderRadius:10,
    padding:14,
  },
  errorTxt: {
    fontSize:14,
    color:"#C0392B",
    lineHeight:20,
  },

  answerWrap: { paddingBottom:4 },
  answerMeta: {
    flexDirection:"row",
    alignItems:"center",
    gap:8,
    marginBottom:10,
  },
  aiDotSmall: {
    width:7,
    height:7,
    borderRadius:3.5,
    backgroundColor:GREEN,
  },
  answerMetaTxt: {
    fontSize:12,
    color:GREEN,
    fontWeight:"700",
    letterSpacing:0.5,
  },
  answerTxt: {
    fontSize:15,
    color:"#2A2218",
    lineHeight:24,
    fontWeight:"400",
  },
  askAgainBtn: {
    marginTop:14,
    alignSelf:"flex-start",
    paddingVertical:8,
    paddingHorizontal:14,
    backgroundColor:"#F0EAE0",
    borderRadius:50,
    borderWidth:1,
    borderColor:"#C8BFB2",
  },
  askAgainTxt: {
    fontSize:13,
    color:"#1E3D30",
    fontWeight:"600",
  },

  // Input row
  inputRow: {
    flexDirection:"row",
    alignItems:"center",
    paddingHorizontal:14,
    paddingVertical:12,
    gap:8,
    borderTopWidth:1,
    borderTopColor:"#E8E0D4",
    backgroundColor:PARCHMENT,
    borderBottomLeftRadius:0,
    borderBottomRightRadius:0,
  },

  micBtn: {
    width:38,
    height:38,
    borderRadius:19,
    backgroundColor:"#F0EAE0",
    borderWidth:1,
    borderColor:"#C8BFB2",
    alignItems:"center",
    justifyContent:"center",
  },
  micBtnActive: {
    backgroundColor:"rgba(184,146,42,0.15)",
    borderColor:GOLD,
  },

  input: {
    flex:1,
    fontSize:15,
    color:"#2A2218",
    paddingVertical:8,
    paddingHorizontal:12,
    backgroundColor:"#F5EDE0",
    borderRadius:20,
    borderWidth:1,
    borderColor:"#C8BFB2",
  },

  sendBtn: {
    width:38,
    height:38,
    borderRadius:19,
    backgroundColor:GREEN,
    alignItems:"center",
    justifyContent:"center",
  },
  sendBtnOff: {
    backgroundColor:"#C8BFB2",
  },
});
