import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import ExploreCard from '../../components/ExploreCard';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';
import { ADMIN_EXPLORE_CARDS } from '../../utils/dummy_data';

export default function ExploreScreen() {
  function handleCard(title: string) {
    Alert.alert(title, `Opening ${title} module...`);
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Explore</Text>
      <Text style={styles.pageSubtitle}>Access all lab management modules</Text>

      {ADMIN_EXPLORE_CARDS.map((section) => (
        <View key={section.section} style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>{section.section}</Text>
          </View>
          <View style={styles.cardsRow}>
            {section.items.map((item) => (
              <ExploreCard
                key={item.id}
                title={item.title}
                icon={item.icon}
                color={item.color}
                bgColor={item.bgColor}
                onPress={() => handleCard(item.title)}
              />
            ))}
          </View>
        </View>
      ))}
      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md },
  pageTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  pageSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: 8,
  },
  sectionDot: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  cardsRow: { flexDirection: 'row', flexWrap: 'wrap' },
});
