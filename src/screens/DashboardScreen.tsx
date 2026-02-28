import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { getIdeas, addIdea } from '../database/db';

type Idea = {
    id: number;
    content: string;
    type: string;
    created_at: string;
};

export default function DashboardScreen() {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [inputText, setInputText] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Idea', 'Story', 'Character', 'Dialogue', 'Setting'];

    useEffect(() => {
        loadIdeas();
    }, []);

    const loadIdeas = async () => {
        const data = await getIdeas();
        setIdeas(data);
    };

    const handleSaveIdea = async () => {
        if (!inputText.trim()) return;

        // Auto-detect type based on filter or default to Idea
        const type = activeFilter !== 'All' ? activeFilter : 'Idea';

        await addIdea(inputText.trim(), type);
        setInputText('');
        loadIdeas();
    };

    const filteredIdeas = activeFilter === 'All'
        ? ideas
        : ideas.filter(idea => idea.type === activeFilter);

    // Split into left and right columns for masonry effect
    const leftColumn = filteredIdeas.filter((_, i) => i % 2 === 0);
    const rightColumn = filteredIdeas.filter((_, i) => i % 2 === 1);

    const renderIdeaCard = (idea: Idea) => (
        <TouchableOpacity key={idea.id} style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{idea.type.toUpperCase()}</Text>
                </View>
                <MaterialIcons name="more-horiz" size={16} color={colors.light.secondary_text} />
            </View>
            <Text style={styles.cardContent}>{idea.content}</Text>
            <View style={styles.cardFooter}>
                <MaterialIcons name="schedule" size={12} color={colors.light.secondary_text} />
                {/* Very primitive time formatting for MVP */}
                <Text style={styles.timeText}>{new Date(idea.created_at).toLocaleDateString()}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.headerContainer}>
                    <View style={styles.headerTop}>
                        <Text style={styles.headerTitle}>Idea Vault</Text>
                        <TouchableOpacity style={styles.accountBtn}>
                            <MaterialIcons name="account-circle" size={28} color={colors.light.primary_text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputPrompt}>{`>`}</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Log a thought or scene..."
                            placeholderTextColor={colors.light.secondary_text}
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={handleSaveIdea}
                            returnKeyType="done"
                        />
                        <TouchableOpacity style={styles.micBtn} onPress={handleSaveIdea}>
                            {inputText.length > 0 ? (
                                <MaterialIcons name="send" size={24} color={colors.light.primary_text} />
                            ) : (
                                <MaterialIcons name="mic" size={24} color={colors.light.primary_text} />
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filtersScroll}
                        contentContainerStyle={styles.filtersContainer}
                    >
                        {filters.map(f => (
                            <TouchableOpacity
                                key={f}
                                style={[
                                    styles.filterPill,
                                    activeFilter === f && styles.filterPillActive
                                ]}
                                onPress={() => setActiveFilter(f)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    activeFilter === f && styles.filterTextActive
                                ]}>{f}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView style={styles.scrollContent} contentContainerStyle={styles.masonryContainer}>
                    <View style={styles.column}>
                        {leftColumn.map(renderIdeaCard)}
                    </View>
                    <View style={styles.column}>
                        {rightColumn.map(renderIdeaCard)}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: 'rgba(248, 248, 246, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontFamily: typography.serif,
        fontSize: 28,
        fontWeight: '600',
        color: colors.light.primary_text,
        letterSpacing: -0.5,
    },
    accountBtn: {
        padding: 4,
    },
    inputWrapper: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light.card,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.light.border,
        paddingHorizontal: 12,
        height: 50,
    },
    inputPrompt: {
        fontFamily: typography.mono,
        fontSize: 18,
        color: colors.light.secondary_text,
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        fontFamily: typography.mono,
        fontSize: 14,
        color: colors.light.primary_text,
        height: '100%',
    },
    micBtn: {
        padding: 4,
    },
    filtersScroll: {
        marginTop: 12,
    },
    filtersContainer: {
        paddingBottom: 4,
        gap: 8,
    },
    filterPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: colors.light.border,
        borderRadius: 8,
    },
    filterPillActive: {
        backgroundColor: colors.light.primary_btn,
        borderColor: colors.light.primary_btn,
    },
    filterText: {
        fontFamily: typography.mono,
        fontSize: 12,
        color: colors.light.secondary_text,
    },
    filterTextActive: {
        color: colors.light.primary_btn_text,
    },
    scrollContent: {
        flex: 1,
    },
    masonryContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 16,
        paddingBottom: 40,
    },
    column: {
        flex: 1,
        gap: 16,
    },
    card: {
        backgroundColor: colors.light.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.light.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    tagBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        fontFamily: typography.mono,
        fontSize: 10,
        color: '#6B7280',
        letterSpacing: 0.5,
    },
    cardContent: {
        fontFamily: typography.mono,
        fontSize: 12,
        color: colors.light.primary_text,
        lineHeight: 18,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: 10,
        color: colors.light.secondary_text,
    }
});
