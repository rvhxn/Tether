import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView, Modal, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { fetchIdeas, createIdea, updateIdea, deleteIdea } from '../services/api';

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

    // Modal state for options
    const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
    const [selectedIdeaForOptions, setSelectedIdeaForOptions] = useState<Idea | null>(null);
    const [optionsMode, setOptionsMode] = useState<'menu' | 'confirmDelete'>('menu');

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
        try {
            const data = await fetchIdeas();
            setIdeas(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveIdea = async () => {
        if (!inputText.trim()) return;

        try {
            await createIdea(inputText.trim(), selectedInputType);
            setInputText('');
            loadIdeas();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditIdea = (idea: Idea) => {
        setEditingIdea(idea);
        setEditContent(idea.content);
        setEditType(idea.type);
        setIsEditModalVisible(true);
    };

    const handleUpdateIdea = async () => {
        if (!editingIdea || !editContent.trim()) return;

        try {
            await updateIdea(editingIdea.id, editContent.trim(), editType);
            setIsEditModalVisible(false);
            loadIdeas();
        } catch (error) {
            console.error(error);
        }
    };

    // Legacy delete function removed in favor of inline modal log.

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
                        setSelectedIdeaForOptions(idea);
                        setOptionsMode('menu');
                        setIsOptionsModalVisible(true);
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

                    <ScrollView style={styles.scrollContent} contentContainerStyle={[styles.masonryContainer, { paddingBottom: 24 + insets.bottom }]}>
                        <View style={styles.column}>
                            {leftColumn.map(renderIdeaCard)}
                        </View>
                        <View style={styles.column}>
                            {rightColumn.map(renderIdeaCard)}
                        </View>
                    </ScrollView>
                    {/* Edit Modal */}
                    <Modal
                        visible={isEditModalVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setIsEditModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                                <View style={styles.dragHandle} />
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Refine</Text>
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
                                                        borderColor: getTagStyles(type).bg,
                                                    }
                                                ]}
                                                onPress={() => setEditType(type)}
                                            >
                                                {editType === type ? (
                                                    <View style={[styles.activeTagIcon, { backgroundColor: getTagStyles(type).text }]}>
                                                        <MaterialIcons name="check" size={12} color={colors.light.card} />
                                                    </View>
                                                ) : (
                                                    <View style={styles.inactiveTagIcon} />
                                                )}
                                                <Text style={[
                                                    styles.premiumTagText,
                                                    editType === type && { color: getTagStyles(type).text, fontFamily: typography.monoBold }
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

                    {/* Options / Action Sheet Modal */}
                    <Modal
                        visible={isOptionsModalVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setIsOptionsModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                                <View style={styles.dragHandle} />

                                {optionsMode === 'menu' ? (
                                    <>
                                        <View style={styles.modalHeader}>
                                            <Text style={styles.modalTitle}>Options</Text>
                                            <TouchableOpacity onPress={() => setIsOptionsModalVisible(false)} style={styles.closeModalBtn}>
                                                <MaterialIcons name="close" size={24} color={colors.light.secondary_text} />
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.optionBtn}
                                            onPress={() => {
                                                setIsOptionsModalVisible(false);
                                                if (selectedIdeaForOptions) handleEditIdea(selectedIdeaForOptions);
                                            }}
                                        >
                                            <MaterialIcons name="edit" size={20} color={colors.light.primary_text} />
                                            <Text style={styles.optionBtnText}>Edit</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.optionBtn, styles.optionBtnDestructive]}
                                            onPress={() => setOptionsMode('confirmDelete')}
                                        >
                                            <MaterialIcons name="delete-outline" size={20} color="#DC2626" />
                                            <Text style={[styles.optionBtnText, { color: '#DC2626' }]}>Delete</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <View style={styles.modalHeader}>
                                            <Text style={styles.modalTitle}>Delete?</Text>
                                            <TouchableOpacity onPress={() => setIsOptionsModalVisible(false)} style={styles.closeModalBtn}>
                                                <MaterialIcons name="close" size={24} color={colors.light.secondary_text} />
                                            </TouchableOpacity>
                                        </View>

                                        <Text style={styles.confirmText}>This action cannot be undone. Are you sure you want to permanently delete this thought?</Text>

                                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                                            <TouchableOpacity
                                                style={[styles.premiumSaveBtn, { flex: 1, backgroundColor: colors.light.card, borderWidth: 1, borderColor: colors.light.border, shadowOpacity: 0, elevation: 0 }]}
                                                onPress={() => setOptionsMode('menu')}
                                            >
                                                <Text style={[styles.premiumSaveBtnText, { color: colors.light.primary_text }]}>CANCEL</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.premiumSaveBtn, { flex: 1, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2', shadowOpacity: 0, elevation: 0 }]}
                                                onPress={async () => {
                                                    if (selectedIdeaForOptions) {
                                                        try {
                                                            await deleteIdea(selectedIdeaForOptions.id);
                                                            setIsOptionsModalVisible(false);
                                                            loadIdeas();
                                                        } catch (error) {
                                                            console.error("Failed to delete idea:", error);
                                                        }
                                                    }
                                                }}
                                            >
                                                <Text style={[styles.premiumSaveBtnText, { color: '#DC2626' }]}>DELETE</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light.card,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.light.border,
        paddingHorizontal: 12,
        height: 54,
        marginBottom: 12,
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
        fontFamily: typography.monoBold,
        fontSize: 14,
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
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 20,
        paddingTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    dragHandle: {
        width: 36,
        height: 4,
        backgroundColor: colors.light.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
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
        letterSpacing: -0.5,
    },
    closeModalBtn: {
        padding: 4,
    },
    modalTextInput: {
        fontFamily: typography.mono,
        fontSize: 16,
        lineHeight: 24,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 20,
        minHeight: 140,
        textAlignVertical: 'top',
        color: colors.light.primary_text,
        marginBottom: 24,
    },
    modalSection: {
        marginBottom: 32,
    },
    modalLabel: {
        fontFamily: typography.monoBold,
        fontSize: 11,
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
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: colors.light.border,
        backgroundColor: colors.light.card,
    },
    activeTagIcon: {
        width: 18,
        height: 18,
        borderRadius: 9,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inactiveTagIcon: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: colors.light.secondary_text,
        marginRight: 10,
        opacity: 0.3,
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
        fontFamily: typography.monoBold,
        color: colors.light.primary_btn_text,
        fontSize: 16,
        letterSpacing: 1,
    },
    optionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        marginBottom: 12,
        gap: 16,
    },
    optionBtnDestructive: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    optionBtnText: {
        fontFamily: typography.monoBold,
        fontSize: 15,
        color: colors.light.primary_text,
    },
    confirmText: {
        fontFamily: typography.mono,
        fontSize: 14,
        color: colors.light.secondary_text,
        lineHeight: 22,
        marginBottom: 8,
    }
});
