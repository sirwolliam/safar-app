/**
 * Drop this snippet into your ProfileScreen.jsx
 * wherever your settings/account rows are listed.
 *
 * Make sure ProfileScreen receives { navigation } as a prop.
 */

// Add this row inside your ProfileScreen's settings list:

<TouchableOpacity
  style={styles.settingsRow}
  onPress={() => navigation.navigate("Support")}
  activeOpacity={0.85}
>
  <View style={styles.settingsIconWrap}>
    <Text style={styles.settingsIcon}>🤲</Text>
  </View>
  <View style={styles.settingsInfo}>
    <Text style={styles.settingsLabel}>Help & Support</Text>
    <Text style={styles.settingsSub}>FAQs, tutorials, contact us</Text>
  </View>
  <Text style={styles.settingsArrow}>›</Text>
</TouchableOpacity>

// Also add this row for Settings:
<TouchableOpacity
  style={styles.settingsRow}
  onPress={() => navigation.navigate("Settings")}
  activeOpacity={0.85}
>
  <View style={styles.settingsIconWrap}>
    <Text style={styles.settingsIcon}>⚙️</Text>
  </View>
  <View style={styles.settingsInfo}>
    <Text style={styles.settingsLabel}>Settings</Text>
    <Text style={styles.settingsSub}>Display, accessibility, notifications</Text>
  </View>
  <Text style={styles.settingsArrow}>›</Text>
</TouchableOpacity>
