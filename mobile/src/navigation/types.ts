import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Rotas do app: abas na raiz; Igrejas e Padres têm pilhas próprias (lista -> detalhe).
export type ChurchesStackParamList = {
  ChurchesList: { forania?: string } | undefined;
  ChurchDetail: { churchId: number };
};

export type PriestsStackParamList = {
  PriestsList: undefined;
  PriestDetail: { priestId: number };
};

export type RootTabParamList = {
  Home: undefined;
  Churches: NavigatorScreenParams<ChurchesStackParamList> | undefined;
  /** `day`: nome do dia ("Domingo"...); `now`: carimbo para forçar a atualização ao tocar em "Agora". */
  Masses: { day?: string; now?: number } | undefined;
  Priests: NavigatorScreenParams<PriestsStackParamList> | undefined;
};

export type RootTabScreenProps<T extends keyof RootTabParamList> = BottomTabScreenProps<RootTabParamList, T>;

export type ChurchesStackScreenProps<T extends keyof ChurchesStackParamList> = CompositeScreenProps<
  StackScreenProps<ChurchesStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;

export type PriestsStackScreenProps<T extends keyof PriestsStackParamList> = CompositeScreenProps<
  StackScreenProps<PriestsStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;

// Tipagem global: useNavigation()/navigationRef conhecem as rotas da raiz.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootTabParamList {}
  }
}
