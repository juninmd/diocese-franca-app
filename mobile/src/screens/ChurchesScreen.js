import React from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListSkeleton } from '../components/Skeleton';
import { ChurchCard } from '../components/churches/ChurchCard';
import { ChurchesHeader } from '../components/churches/ChurchesHeader';
import { ChurchesEmpty } from '../components/churches/ChurchesEmpty';
import { useChurchesList } from '../components/churches/useChurchesList';
import { FadeIn } from '../components/ui';
import { useSearch } from '../context/SearchContext';
import { colors } from '../theme';

export default function ChurchesScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const list = useChurchesList(route?.params?.forania || null);
  const search = useSearch();
  const showSkeleton = list.loading && !list.refreshing;

  const header = (
    <ChurchesHeader
      count={list.filteredChurches.length}
      total={list.churches.length}
      favoritesCount={list.favorites.length}
      searchQuery={list.searchQuery}
      onSearch={list.setSearchQuery}
      filterMode={list.filterMode}
      onFilter={list.selectFilterMode}
      loading={showSkeleton}
      foranias={list.foranias}
      forania={list.forania}
      onForania={list.setForania}
      onOpenSearch={search.open}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={showSkeleton ? [] : list.filteredChurches}
        keyExtractor={(item) => item.id.toString()}
        initialNumToRender={50} // catálogo pequeno (~45): renderiza tudo e evita buracos ao rolar rápido
        renderItem={({ item, index }) => (
          <FadeIn index={index}>
          <ChurchCard
            church={item}
            isFavorite={list.favorites.includes(item.id)}
            onPress={() => navigation.navigate('ChurchDetail', { churchId: item.id })}
            onToggleFavorite={() => list.toggleFavorite(item)}
            onShare={() => list.shareChurch(item)}
          />
          </FadeIn>
        )}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={header}
        ListEmptyComponent={
          showSkeleton ? <ListSkeleton count={5} type="church" /> : (
            <ChurchesEmpty
              error={list.error}
              nearbyError={list.nearbyError}
              nearbyLoading={list.nearbyLoading}
              nearbyCount={list.nearbyChurches.length}
              filterMode={list.filterMode}
              searchQuery={list.searchQuery}
              onRefresh={list.onRefresh}
              onFilter={list.selectFilterMode}
              onRetryNearby={list.loadNearbyChurches}
            />
          )
        }
        contentContainerStyle={{ paddingTop: insets.top + 28, paddingHorizontal: 20, paddingBottom: 110 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={list.refreshing} onRefresh={list.onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
      />
    </View>
  );
}

const Separator = () => <View style={{ height: 12 }} />;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
});
