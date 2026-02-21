import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Scripture, scriptures as INITIAL_SCRIPTURES } from '../data/scriptures';
import { supabase } from '../lib/supabase';

interface LibraryState {
    scriptures: Scripture[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchScriptures: () => Promise<void>;
    addScripture: (scripture: Scripture) => Promise<void>;
    updateScripture: (id: string, updates: Partial<Scripture>) => Promise<void>;
    removeScripture: (id: string) => Promise<void>;

    // Legacy/Helper
    allScriptures: () => Scripture[];
}

// Utility to map DB snake_case to Frontend camelCase
const mapFromDb = (dbItem: any): Scripture => ({
    id: dbItem.id,
    title: dbItem.title,
    author: dbItem.author,
    description: dbItem.description,
    size: dbItem.size,
    coverImage: dbItem.cover_image,
    audioUrl: dbItem.audio_url,
    bgmUrl: dbItem.bgm_url,
    content: dbItem.content,
    pages: dbItem.pages,
});

// Utility to map Frontend camelCase to DB snake_case
const mapToDb = (item: Partial<Scripture>) => {
    const db: any = {};
    if (item.id !== undefined) db.id = item.id;
    if (item.title !== undefined) db.title = item.title;
    if (item.author !== undefined) db.author = item.author;
    if (item.description !== undefined) db.description = item.description;
    if (item.size !== undefined) db.size = item.size;
    if (item.coverImage !== undefined) db.cover_image = item.coverImage;
    if (item.audioUrl !== undefined) db.audio_url = item.audioUrl;
    if (item.bgmUrl !== undefined) db.bgm_url = item.bgmUrl;
    if (item.content !== undefined) db.content = item.content;
    if (item.pages !== undefined) db.pages = item.pages;
    return db;
};

export const useLibraryStore = create<LibraryState>()(
    persist(
        (set, get) => ({
            scriptures: INITIAL_SCRIPTURES,
            isLoading: false,
            error: null,

            fetchScriptures: async () => {
                set({ isLoading: true, error: null });
                try {
                    const { data, error } = await supabase
                        .from('scriptures')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (error) throw error;

                    if (data) {
                        const mapped = data.map(mapFromDb);
                        // 合并逻辑：如果云端没数据，保留预设；如果有，以云端为准
                        set({ scriptures: mapped.length > 0 ? mapped : INITIAL_SCRIPTURES });
                    }
                } catch (err: any) {
                    set({ error: err.message });
                    console.error('Fetch scriptures error:', err);
                } finally {
                    set({ isLoading: false });
                }
            },

            addScripture: async (scripture) => {
                set({ isLoading: true, error: null });
                try {
                    const dbData = mapToDb(scripture);
                    const { error } = await supabase
                        .from('scriptures')
                        .insert([dbData]);

                    if (error) throw error;

                    set((state) => ({
                        scriptures: [scripture, ...state.scriptures]
                    }));
                } catch (err: any) {
                    set({ error: err.message });
                    alert(`添加失败: ${err.message}`);
                } finally {
                    set({ isLoading: false });
                }
            },

            updateScripture: async (id, updates) => {
                set({ isLoading: true, error: null });
                try {
                    const dbData = mapToDb(updates);
                    const { error } = await supabase
                        .from('scriptures')
                        .update(dbData)
                        .eq('id', id);

                    if (error) throw error;

                    set((state) => ({
                        scriptures: state.scriptures.map(s => s.id === id ? { ...s, ...updates } : s)
                    }));
                } catch (err: any) {
                    set({ error: err.message });
                    alert(`更新失败: ${err.message}`);
                } finally {
                    set({ isLoading: false });
                }
            },

            removeScripture: async (id) => {
                set({ isLoading: true, error: null });
                try {
                    const { error } = await supabase
                        .from('scriptures')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;

                    set((state) => ({
                        scriptures: state.scriptures.filter((s) => s.id !== id)
                    }));
                } catch (err: any) {
                    set({ error: err.message });
                    alert(`删除失败: ${err.message}`);
                } finally {
                    set({ isLoading: false });
                }
            },

            allScriptures: () => get().scriptures,
        }),
        {
            name: 'zen-library',
            version: 3,
            migrate: (persisted: any, version: number) => {
                if (version < 3) {
                    return { ...persisted, isLoading: false, error: null };
                }
                return persisted as LibraryState;
            },
        }
    )
);