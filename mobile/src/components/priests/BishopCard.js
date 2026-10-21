import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Button, ArchArt } from '../ui';
import { colors, radius } from '../../theme';
import { PriestAvatar } from './PriestAvatar';
import { PriestActions } from './PriestActions';
import { openCall, openEmail } from './priestUtils';

// Cartão em destaque do bispo diocesano (dados reais da API).
export function BishopCard({ priest, isFavorite, onOpen, onFavorite, onShare }) {
  return (
    <View style={styles.card} accessibilityLabel={priest.title}>
      <View pointerEvents="none" style={styles.art}>
        <ArchArt width={90} color={colors.goldLight} />
      </View>
      <View style={styles.top}>
        <TouchableOpacity activeOpacity={0.8} style={styles.main} onPress={onOpen}>
          <PriestAvatar name={priest.name} image={priest.image} size={72} bg={colors.goldLight} color={colors.onGold} />
          <View style={styles.info}>
            <Text variant="overline" style={styles.overline}>{priest.title}</Text>
            <Text variant="title" style={styles.name}>{priest.name}</Text>
          </View>
        </TouchableOpacity>
        <PriestActions onDark name={priest.name} isFavorite={isFavorite} onFavorite={onFavorite} onShare={onShare} />
      </View>
      <View style={styles.buttons}>
        {priest.phone ? <Button tone="gold" icon="call-outline" label="Ligar" onPress={() => openCall(priest.phone)} /> : null}
        {priest.email ? <Button tone="outlineLight" icon="mail-outline" label="E-mail" onPress={() => openEmail(priest.email)} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderRadius: radius.xl, backgroundColor: colors.primaryDark, padding: 22, gap: 16 },
  art: { position: 'absolute', right: -4, bottom: -8, opacity: 0.3 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16 },
  info: { flex: 1, gap: 4 },
  overline: { color: colors.goldLight },
  name: { color: colors.cream, fontSize: 23, lineHeight: 26 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
