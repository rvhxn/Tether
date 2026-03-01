import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView, Modal, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { getIdeas, addIdea, updateIdea, deleteIdea } from '../database/db';

type Idea = {
    id: number;
    content: string;
    type: string;
    created_at: string;
};

export default function DashboardScreen() {
    const insets = useSafeAreaInsets();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [inputText, setInputText] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedInputType, setSelectedInputType] = useState('Topic');

    // Modal state for editing
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editType, setEditType] = useState('Topic');

    const filters = ['All', 'Topic', 'Character'];

    useEffect(() => {
        loadIdeas();
    }, []);

    // Sync input type with filter if filter is specific
    useEffect(() => {
        if (activeFilter !== 'All') {
            setSelectedInputType(activeFilter);
        }
    }, [activeFilter]);

    const loadIdeas = async () => {
        const data = await getIdeas();
        setIdeas(data);
    };

    const handleSaveIdea = async () => {
        if (!inputText.trim()) return;

        await addIdea(inputText.trim(), selectedInputType);
        setInputText('');
        loadIdeas();
    };

    const handleEditIdea = (idea: Idea) => {
        setEditingIdea(idea);
        setEditContent(idea.content);
        setEditType(idea.type);
        setIsEditModalVisible(true);
    };

    const handleUpdateIdea = async () => {
        if (!editingIdea || !editContent.trim()) return;

        await updateIdea(editingIdea.id, editContent.trim(), editType);
        setIsEditModalVisible(false);
        loadIdeas();
    };

    const confirmDeleteIdea = (id: number) => {
        Alert.alert(
            "Delete Idea",
            "Are you sure you want to remove this thought permanently?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteIdea(id);
                        loadIdeas();
                    }
                }
            ]
        );
    };

    const getTagStyles = (type: string) => {
        switch (type.toLowerCase()) {
            case 'topic':
                return { bg: colors.light.tag_topic_bg, text: colors.light.tag_topic_text };
            case 'character':
                return { bg: colors.light.tag_character_bg, text: colors.light.tag_character_text };
            default:
                return { bg: colors.light.tag_default_bg, text: colors.light.tag_default_text };
        }
    };

    const filteredIdeas = activeFilter === 'All'
        ? ideas
        : ideas.filter(idea => idea.type === activeFilter);

    const leftColumn = filteredIdeas.filter((_, i) => i % 2 === 0);
    const rightColumn = filteredIdeas.filter((_, i) => i % 2 === 1);

    const renderIdeaCard = (idea: Idea) => {
        const tagStyles = getTagStyles(idea.type);
        return (
            <TouchableOpacity key={idea.id} style={styles.card} activeOpacity={0.9}>
                <View style={styles.cardHeader}>
                    <View style={[styles.tagBadge, { backgroundColor: tagStyles.bg }]}>
                        <Text style={[styles.tagText, { color: tagStyles.text }]}>{idea.type.toUpperCase()}</Text>
                    </View>
                    <TouchableOpacity onPress={() => {
                        Alert.alert(
                            "Options",
                            "What would you like to do?",
                            [
                                { text: "Edit", onPress: () => handleEditIdea(idea) },
                                { text: "Delete", style: "destructive", onPress: () => confirmDeleteIdea(idea.id) },
                                { text: "Cancel", style: "cancel" }
                            ]
                        );
                    }} style={styles.moreBtn}>
                        <MaterialIcons name="more-horiz" size={18} color={colors.light.secondary_text} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.cardContent}>{idea.content}</Text>
                <View style={styles.cardFooter}>
                    <MaterialIcons name="schedule" size={12} color={colors.light.secondary_text} />
                    <Text style={styles.timeText}>{new Date(idea.created_at).toLocaleDateString()}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.safeArea}>
            <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.headerContainer}>
                        <View style={styles.headerTop}>
                            <Text style={styles.headerTitle}>Tether</Text>
                            <TouchableOpacity style={styles.accountBtn}>
                                <MaterialIcons name="account-circle" size={28} color={colors.light.primary_text} />
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

                    <ScrollView style={styles.scrollContent} contentContainerStyle={[styles.masonryContainer, { paddingBottom: 100 + insets.bottom }]}>
                        <View style={styles.column}>
                            {leftColumn.map(renderIdeaCard)}
                        </View>
                        <View style={styles.column}>
                            {rightColumn.map(renderIdeaCard)}
                        </View>
                    </ScrollView>

                    <View style={[styles.inputFixedContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                        <View style={styles.inputWrapper}>
                            <TouchableOpacity
                                style={[styles.typeToggle, { backgroundColor: getTagStyles(selectedInputType).bg }]}
                                onPress={() => setSelectedInputType(prev => prev === 'Topic' ? 'Character' : 'Topic')}
                            >
                                <Text style={[styles.typeToggleText, { color: getTagStyles(selectedInputType).text }]}>
                                    {selectedInputType === 'Topic' ? 'T' : 'C'}
                                </Text>
                            </TouchableOpacity>
                            <TextInput
                                style={styles.textInput}
                                placeholder={`Log a ${selectedInputType.toLowerCase()}...`}
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
                    </View>

                    {/* Edit Modal */}
                    <Modal
                        visible={isEditModalVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setIsEditModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Refine Thought</Text>
                                    <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={styles.closeModalBtn}>
                                        <MaterialIcons name="close" size={24} color={colors.light.secondary_text} />
                                    </TouchableOpacity>
                                </View>

                                <TextInput
                                    style={styles.modalTextInput}
                                    multiline
                                    value={editContent}
                                    onChangeText={setEditContent}
                                    placeholder="Type your revised thought..."
                                    placeholderTextColor="#999"
                                    autoFocus
                                />

                                <View style={styles.modalSection}>
                                    <Text style={styles.modalLabel}>TAG AS</Text>
                                    <View style={styles.modalTagGrid}>
                                        {['Topic', 'Character'].map(type => (
                                            <TouchableOpacity
                                                key={type}
                                                style={[
                                                    styles.premiumTagOption,
                                                    editType === type && {
                                                        backgroundColor: getTagStyles(type).bg,
                                                        borderColor: getTagStyles(type).text,
                                                        borderWidth: 1.5
                                                    }
                                                ]}
                                                onPress={() => setEditType(type)}
                                            >
                                                <View style={[styles.tagIndicator, { backgroundColor: getTagStyles(type).text }]} />
                                                <Text style={[
                                                    styles.premiumTagText,
                                                    editType === type && { color: getTagStyles(type).text, fontWeight: '700' }
                                                ]}>{type}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.premiumSaveBtn}
                                    onPress={handleUpdateIdea}
                                >
                                    <Text style={styles.premiumSaveBtnText}>SAVE CHANGES</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
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
    inputFixedContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(248, 248, 246, 0.95)',
        borderTopWidth: 1,
        borderTopColor: colors.light.border,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light.card,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.light.border,
        paddingHorizontal: 12,
        height: 54,
    },
    typeToggle: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    typeToggleText: {
        fontFamily: typography.mono,
        fontSize: 14,
        fontWeight: '700',
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
        paddingHorizontal: 14,
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
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        fontFamily: typography.mono,
        fontSize: 10,
        letterSpacing: 0.5,
    },
    moreBtn: {
        padding: 4,
        marginRight: -4,
        marginTop: -4,
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
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.light.card,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontFamily: typography.serif,
        fontSize: 24,
        fontWeight: '700',
        color: colors.light.primary_text,
    },
    closeModalBtn: {
        padding: 4,
    },
    modalTextInput: {
        fontFamily: typography.mono,
        fontSize: 16,
        backgroundColor: '#F9F9F8',
        borderRadius: 16,
        padding: 20,
        minHeight: 140,
        textAlignVertical: 'top',
        color: colors.light.primary_text,
        borderWidth: 1,
        borderColor: colors.light.border,
        marginBottom: 24,
    },
    modalSection: {
        marginBottom: 32,
    },
    modalLabel: {
        fontFamily: typography.sans,
        fontSize: 11,
        fontWeight: '800',
        color: colors.light.secondary_text,
        marginBottom: 16,
        letterSpacing: 1.5,
    },
    modalTagGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    premiumTagOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.light.border,
        backgroundColor: colors.light.background,
    },
    tagIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 10,
    },
    premiumTagText: {
        fontFamily: typography.mono,
        fontSize: 13,
        color: colors.light.secondary_text,
    },
    premiumSaveBtn: {
        backgroundColor: colors.light.primary_btn,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.light.primary_btn,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    premiumSaveBtnText: {
        fontFamily: typography.mono,
        color: colors.light.primary_btn_text,
        fontWeight: '800',
        fontSize: 16,
        letterSpacing: 1,
    }
});
