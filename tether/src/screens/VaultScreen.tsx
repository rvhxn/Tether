import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { getCollisions } from '../database/db';

type Collision = {
    id: number;
    idea_ids: string;
    combined_text: string;
    title: string | null;
    logline: string | null;
    tags: string | null;
    created_at: string;
};

export default function VaultScreen() {
    const insets = useSafeAreaInsets();
    const [collisions, setCollisions] = useState<Collision[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [activeFilter, setActiveFilter] = useState('All');

    useFocusEffect(
        useCallback(() => {
            loadCollisions();
        }, [])
    );

    const loadCollisions = async () => {
        const data = await getCollisions();
        setCollisions(data);
    };

    const toggleExpand = (id: number) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    const uniqueTags = useMemo(() => {
        const tags = new Set<string>();
        collisions.forEach(c => {
            if (c.tags) {
                // Remove '#' before adding to the Set for cleaner filtering internally
                tags.add(c.tags.replace('#', ''));
            }
        });
        return ['All', ...Array.from(tags).sort()];
    }, [collisions]);

    const filteredCollisions = useMemo(() => {
        if (activeFilter === 'All') return collisions;
        return collisions.filter(c => c.tags?.replace('#', '') === activeFilter);
    }, [activeFilter, collisions]);

    const renderItem = ({ item }: { item: Collision }) => {
        const isExpanded = expandedId === item.id;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="folder-open" size={20} color={colors.light.primary_text} />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.cardTitle}>{item.title || 'Untitled Concept'}</Text>
                        <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                    <MaterialIcons
                        name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                        size={24}
                        color={colors.light.secondary_text}
                    />
                </View>

                {isExpanded && (
                    <View style={styles.cardBody}>
                        {item.logline && (
                            <View style={styles.loglineWrapper}>
                                <Text style={styles.label}>LOGLINE:</Text>
                                <Text style={styles.loglineText}>{item.logline}</Text>
                            </View>
                        )}

                        <View style={styles.ideasWrapper}>
                            <Text style={styles.label}>COMBINED IDEAS:</Text>
                            <Text style={styles.ideasText}>{item.combined_text}</Text>
                        </View>

                        {item.tags && (
                            <View style={styles.tagsContainer}>
                                <View style={[styles.tagBadge, { backgroundColor: colors.light.tag_default_bg, borderColor: colors.light.tag_default_text }]}>
                                    <Text style={[styles.tagText, { color: colors.light.tag_default_text }]}>{item.tags}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.safeArea}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Idea Vault</Text>
                    <Text style={styles.headerSubtitle}>Saved Tethers</Text>
                </View>

                {collisions.length > 0 && (
                    <View style={styles.filterContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                            {uniqueTags.map(tag => (
                                <TouchableOpacity
                                    key={tag}
                                    style={[styles.filterBtn, activeFilter === tag && styles.filterBtnActive]}
                                    onPress={() => setActiveFilter(tag)}
                                >
                                    <Text style={[styles.filterText, activeFilter === tag && styles.filterTextActive]}>
                                        {tag}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {filteredCollisions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="inventory-2" size={64} color={colors.light.border} />
                        <Text style={styles.emptyText}>Your vault is empty.</Text>
                        <Text style={styles.emptySubtext}>Tether some ideas to start saving.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredCollisions}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={[styles.listContainer, { paddingBottom: Math.max(insets.bottom, 40) }]}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    header: {
        padding: 24,
        paddingTop: 8,
        backgroundColor: colors.light.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
    },
    headerTitle: {
        fontFamily: typography.serif,
        fontSize: 32,
        fontWeight: '600',
        color: colors.light.primary_text,
    },
    headerSubtitle: {
        fontFamily: typography.mono,
        fontSize: 12,
        color: colors.light.secondary_text,
        marginTop: 4,
    },
    filterContainer: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
        backgroundColor: colors.light.background,
    },
    filterScroll: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: colors.light.border,
    },
    filterBtnActive: {
        backgroundColor: colors.light.primary_text,
        borderColor: colors.light.primary_text,
    },
    filterText: {
        fontFamily: typography.mono,
        fontSize: 12,
        color: colors.light.secondary_text,
    },
    filterTextActive: {
        fontFamily: typography.monoBold,
        color: colors.light.background,
    },
    listContainer: {
        padding: 16,
        gap: 16,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.5,
    },
    emptyText: {
        fontFamily: typography.monoBold,
        fontSize: 16,
        color: colors.light.primary_text,
        marginTop: 16,
    },
    emptySubtext: {
        fontFamily: typography.mono,
        fontSize: 12,
        color: colors.light.secondary_text,
        marginTop: 8,
    },
    card: {
        backgroundColor: colors.light.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.light.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    cardTitle: {
        fontFamily: typography.serif,
        fontSize: 18,
        fontWeight: '700',
        color: colors.light.primary_text,
        marginBottom: 4,
    },
    dateText: {
        fontFamily: typography.mono,
        fontSize: 10,
        color: colors.light.secondary_text,
    },
    cardBody: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.light.border,
    },
    label: {
        fontFamily: typography.monoBold,
        fontSize: 10,
        color: colors.light.secondary_text,
        letterSpacing: 1,
        marginBottom: 8,
    },
    loglineWrapper: {
        marginBottom: 16,
        backgroundColor: colors.light.paper_result,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    loglineText: {
        fontFamily: typography.mono,
        fontSize: 12,
        color: colors.light.primary_text,
        lineHeight: 20,
    },
    ideasWrapper: {
        marginBottom: 16,
    },
    ideasText: {
        fontFamily: typography.mono,
        fontSize: 14,
        color: colors.light.secondary_text,
        lineHeight: 22,
    },
    tagsContainer: {
        flexDirection: 'row',
    },
    tagBadge: {
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tagText: {
        fontFamily: typography.mono,
        fontSize: 12,
    }
});
