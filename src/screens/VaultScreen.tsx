import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
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
    const [collisions, setCollisions] = useState<Collision[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);

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
                                <View style={styles.tagBadge}>
                                    <Text style={styles.tagText}>{item.tags}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Vault</Text>
                <Text style={styles.headerSubtitle}>Saved Collisions</Text>
            </View>

            {collisions.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialIcons name="inventory-2" size={64} color={colors.light.border} />
                    <Text style={styles.emptyText}>Your vault is empty.</Text>
                    <Text style={styles.emptySubtext}>Smash some ideas to start saving.</Text>
                </View>
            ) : (
                <FlatList
                    data={collisions}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    header: {
        padding: 24,
        paddingTop: 40,
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
    listContainer: {
        padding: 16,
        gap: 16,
        paddingBottom: 40,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.5,
    },
    emptyText: {
        fontFamily: typography.sans,
        fontSize: 16,
        fontWeight: '600',
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
        marginBottom: 16, // using gap on FlatList contentContainerStyle is not supported on all RN versions, using marginBottom as fallback here or flex layout overgap
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
        fontFamily: typography.sans,
        fontSize: 10,
        fontWeight: '700',
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
        fontFamily: typography.sans,
        fontSize: 14,
        color: colors.light.secondary_text,
        lineHeight: 22,
    },
    tagsContainer: {
        flexDirection: 'row',
    },
    tagBadge: {
        backgroundColor: colors.light.highlighter_yellow_bg,
        borderWidth: 1,
        borderColor: colors.light.highlighter_yellow_border,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tagText: {
        fontFamily: typography.mono,
        fontSize: 12,
        color: colors.light.highlighter_yellow_text,
    }
});
