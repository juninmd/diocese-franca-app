import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Church, Priest } from '../types';

// Registros mínimos guardados no aparelho (os ids são estáveis no backend).
export interface FavoriteChurch {
  id: number;
  name: string;
  address: string;
  city: string;
  addedAt: string;
}

export interface FavoritePriest {
  id: number;
  name: string;
  title: string;
  addedAt: string;
}

const FAVORITES_CHURCHES_KEY = '@diocese_favorites_churches';
const FAVORITES_PRIESTS_KEY = '@diocese_favorites_priests';

export const FavoritesService = {
  async getFavoriteChurches(): Promise<FavoriteChurch[]> {
    try {
      const data = await AsyncStorage.getItem(FAVORITES_CHURCHES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting favorite churches:', error);
      return [];
    }
  },

  async addFavoriteChurch(church: Pick<Church, 'id' | 'name' | 'address' | 'city'>): Promise<FavoriteChurch[]> {
    try {
      const favorites = await this.getFavoriteChurches();
      const exists = favorites.find(f => f.id === church.id);
      if (!exists) {
        favorites.push({
          id: church.id,
          name: church.name,
          address: church.address,
          city: church.city,
          addedAt: new Date().toISOString(),
        });
        await AsyncStorage.setItem(FAVORITES_CHURCHES_KEY, JSON.stringify(favorites));
      }
      return favorites;
    } catch (error) {
      console.error('Error adding favorite church:', error);
      throw error;
    }
  },

  async removeFavoriteChurch(churchId: number): Promise<FavoriteChurch[]> {
    try {
      const favorites = await this.getFavoriteChurches();
      const filtered = favorites.filter(f => f.id !== churchId);
      await AsyncStorage.setItem(FAVORITES_CHURCHES_KEY, JSON.stringify(filtered));
      return filtered;
    } catch (error) {
      console.error('Error removing favorite church:', error);
      throw error;
    }
  },

  async isChurchFavorite(churchId: number): Promise<boolean> {
    try {
      const favorites = await this.getFavoriteChurches();
      return favorites.some(f => f.id === churchId);
    } catch (error) {
      return false;
    }
  },

  async getFavoritePriests(): Promise<FavoritePriest[]> {
    try {
      const data = await AsyncStorage.getItem(FAVORITES_PRIESTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting favorite priests:', error);
      return [];
    }
  },

  async addFavoritePriest(priest: Pick<Priest, 'id' | 'name' | 'title'>): Promise<FavoritePriest[]> {
    try {
      const favorites = await this.getFavoritePriests();
      const exists = favorites.find(f => f.id === priest.id);
      if (!exists) {
        favorites.push({
          id: priest.id,
          name: priest.name,
          title: priest.title,
          addedAt: new Date().toISOString(),
        });
        await AsyncStorage.setItem(FAVORITES_PRIESTS_KEY, JSON.stringify(favorites));
      }
      return favorites;
    } catch (error) {
      console.error('Error adding favorite priest:', error);
      throw error;
    }
  },

  async removeFavoritePriest(priestId: number): Promise<FavoritePriest[]> {
    try {
      const favorites = await this.getFavoritePriests();
      const filtered = favorites.filter(f => f.id !== priestId);
      await AsyncStorage.setItem(FAVORITES_PRIESTS_KEY, JSON.stringify(filtered));
      return filtered;
    } catch (error) {
      console.error('Error removing favorite priest:', error);
      throw error;
    }
  },

  async isPriestFavorite(priestId: number): Promise<boolean> {
    try {
      const favorites = await this.getFavoritePriests();
      return favorites.some(f => f.id === priestId);
    } catch (error) {
      return false;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([FAVORITES_CHURCHES_KEY, FAVORITES_PRIESTS_KEY]);
    } catch (error) {
      console.error('Error clearing favorites:', error);
      throw error;
    }
  },
};