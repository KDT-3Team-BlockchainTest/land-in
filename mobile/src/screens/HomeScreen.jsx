import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adaptEventSummary } from '../api/adapters';
import { eventsApi } from '../api/events';
import ActiveEventCard from '../components/common/ActiveEventCard';
import FeaturedEventCard from '../components/common/FeaturedEventCard';
import ProgressBanner from '../components/common/ProgressBanner';
import SectionHeader from '../components/common/SectionHeader';
import UpcomingEventCard from '../components/common/UpcomingEventCard';
import { useAuth } from '../contexts/useAuth';
import useJoinedEventIds from '../hooks/useJoinedEventIds';
import { colors, font, spacing } from '../theme';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { joinedEventIds, joinEvent } = useJoinedEventIds();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    eventsApi.list().then((list) => setEvents(list ?? [])).catch(() => {});
  }, []);

  const adapted = events.map((ev) => adaptEventSummary(ev, joinedEventIds));
  const featuredEvent = adapted.find((ev) => ev.tag === 'featured' || ev.status === 'featured');
  const activeEvents = adapted.filter((ev) => ev.status === 'active');
  const upcomingEvents = adapted.filter((ev) => ev.status === 'upcoming');

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.greeting}>
            Hello, <Text style={styles.name}>{user?.displayName ?? 'Traveler'}</Text>
          </Text>
          <Text style={styles.pageTitle}>Find your next{'\n'}landmark route.</Text>
        </View>

        <ProgressBanner
          title="Current progress"
          description={`You are exploring ${joinedEventIds.length} route${joinedEventIds.length === 1 ? '' : 's'} right now.`}
          onClick={() => navigation.navigate('진행현황')}
        />

        {featuredEvent && (
          <View style={styles.section}>
            <SectionHeader title="Featured event" description="See the route and reward details at a glance." />
            <FeaturedEventCard
              event={featuredEvent}
              onPress={() => navigation.navigate('EventDetail', { eventId: featuredEvent.id })}
            />
          </View>
        )}

        {activeEvents.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Active events" description="Join a route and keep collecting stamps." />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {activeEvents.map((ev) => (
                <ActiveEventCard
                  key={ev.id}
                  event={{ ...ev, joined: joinedEventIds.includes(ev.id) }}
                  onJoin={() => joinEvent(ev.id)}
                  onPress={() => navigation.navigate('EventDetail', { eventId: ev.id })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Upcoming campaigns" description="Preview future routes before they open." />
            {upcomingEvents.map((ev) => (
              <UpcomingEventCard
                key={ev.id}
                event={ev}
                onPress={() => navigation.navigate('EventDetail', { eventId: ev.id })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxxl },
  intro: { paddingTop: spacing.xs },
  greeting: { fontSize: font.sm, color: colors.gray400, marginBottom: spacing.xs },
  name: { color: colors.primary, fontWeight: '600' },
  pageTitle: { fontSize: font.xxl, fontWeight: '800', color: colors.gray900, lineHeight: 30 },
  section: { gap: spacing.md },
  hScroll: { marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg },
});
