import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, font, radius, spacing } from '../../theme';

export default function CollectionFilterTabs({ filters, activeFilter, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {filters.map((f) => (
        <TouchableOpacity key={f.id} style={[styles.tab, f.id === activeFilter && styles.activeTab]} onPress={() => onChange(f.id)}>
          <Text style={[styles.tabText, f.id === activeFilter && styles.activeTabText]}>{f.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  tab: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.xl, backgroundColor: colors.gray100, marginRight: spacing.sm },
  activeTab: { backgroundColor: colors.primary },
  tabText: { fontSize: font.sm, fontWeight: '600', color: colors.gray500 },
  activeTabText: { color: colors.white },
});
