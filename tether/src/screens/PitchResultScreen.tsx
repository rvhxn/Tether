import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { generatePitch } from '../services/gemini';
import { saveCollision } from '../database/db';
import { useNavigation, useRoute } from '@react-navigation/native';

type Idea = {
    id: number;
    content: string;
    type: string;
    created_at: string;
};

// Insert your Gemini API key here for the MVP test
const GEMINI_API_KEY = "dummy-api-key-for-mvp";

export default function PitchResultScreen() {
    const insets = useSafeAreaInsets();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();

    const ideas = route.params?.ideas as Idea[] || [];

    const [isGenerating, setIsGenerating] = useState(false);
    const [pitchResult, setPitchResult] = useState<{ title: string; logline: string; genre: string } | null>(null);

    // Save Modal State
    const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
    const [customTetherName, setCustomTetherName] = useState('');

    // Auto-generate pitch on screen load
    React.useEffect(() => {
        if (ideas.length > 0 && !pitchResult && !isGenerating) {
            handleGeneratePitch();
        }
    }, []);

    const handleGeneratePitch = async () => {
        if (GEMINI_API_KEY === "dummy-api-key-for-mvp") {
            // Mock result if no real key is provided yet
            setIsGenerating(true);
            setTimeout(() => {
                setPitchResult({
                    title: "The Chlorophyll Protocol",
                    logline: "In a rain-slicked 2084 Tokyo, a retired botanist must pull off the ultimate heist: stealing the consciousness of the world's last naturally growing tree.",
                    genre: "Sci-Fi"
                });
                setIsGenerating(false);
            }, 1500);
            return;
        }

        try {
            setIsGenerating(true);
            const combinedText = ideas.map(i => i.content).join('\n');
            const result = await generatePitch(GEMINI_API_KEY, combinedText);
            setPitchResult(result);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to generate pitch. Check your API key or connection.');
        } finally {
            setIsGenerating(false);
        }
    };

    const getTagStyles = (type: string) => {
        // Simple mapping for PitchResult tags which are currently static categories
        const typeLower = type.toLowerCase();
        if (typeLower.includes('sci') || typeLower.includes('topic')) {
            return { bg: colors.light.tag_topic_bg, text: colors.light.tag_topic_text };
        }
        if (typeLower.includes('noir') || typeLower.includes('character')) {
            return { bg: colors.light.tag_character_bg, text: colors.light.tag_character_text };
        }
        return { bg: colors.light.tag_default_bg, text: colors.light.tag_default_text };
    };

    const toggleSaveModal = () => {
        if (!isSaveModalVisible) {
            // Pre-fill with generated title if one exists, otherwise empty string
            setCustomTetherName(pitchResult ? pitchResult.title : '');
        }
        setIsSaveModalVisible(!isSaveModalVisible);
    };

    const handleSaveCollision = async () => {
        if (!customTetherName.trim()) {
            Alert.alert("Error", "Please enter a name for this Tether.");
            return;
        }

        try {
            const ideaIds = ideas.map(i => i.id);
            const combinedText = ideas.map(i => i.content).join('\n---\n');

            await saveCollision(
                ideaIds,
                combinedText,
                customTetherName.trim(), // User-provided name
                pitchResult?.logline || "No pitch generated.",
                pitchResult?.genre ? `#${pitchResult.genre}` : "#Draft"
            );

            setIsSaveModalVisible(false);
            navigation.navigate('Dashboard');

        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Could not save the tether.');
        }
    };

    return (
        <View style={styles.safeArea}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color={colors.light.primary_text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>TETHER RESULTS</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 60) }]} bounces={false}>
                    <View style={styles.comboArea}>
                        {ideas.map((idea, index) => {
                            const tagStyles = getTagStyles(idea.type);
                            return (
                                <View
                                    key={`${idea.id}-${index}`}
                                    style={styles.comboCard}
                                >
                                    <Text style={styles.comboText} numberOfLines={2}>
                                        {idea.content}
                                    </Text>
                                    <View style={[styles.inlineTagBadge, { backgroundColor: tagStyles.bg, borderColor: tagStyles.text }]}>
                                        <Text style={[styles.inlineTagText, { color: tagStyles.text }]}>{idea.type.toUpperCase()}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={handleGeneratePitch}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <ActivityIndicator color={colors.light.primary_text} size="small" />
                            ) : (
                                <MaterialIcons name="auto-awesome" size={20} color={colors.light.primary_text} />
                            )}
                            <Text style={styles.actionBtnText}>RE-PITCH</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={toggleSaveModal}
                        >
                            <MaterialIcons name="bookmark" size={20} color={colors.light.secondary_text} />
                            <Text style={styles.actionBtnText}>SAVE</Text>
                        </TouchableOpacity>
                    </View>

                    {pitchResult && (
                        <View style={styles.storyDraftContainer}>
                            <View style={styles.draftHeader}>
                                <Text style={styles.draftTitleText}>STORY DRAFT</Text>
                                <View style={styles.versionBadge}>
                                    <Text style={styles.versionText}>v1.0</Text>
                                </View>
                            </View>

                            <View style={styles.paper}>
                                <View style={styles.paperHeader}>
                                    <Text style={styles.paperTitle}>{pitchResult.title}</Text>
                                    <Text style={styles.paperSubtitle}>Screenplay Draft • Generated</Text>
                                </View>

                                <View style={styles.paperContent}>
                                    <Text style={styles.loglineLabel}>LOGLINE:</Text>
                                    <Text style={styles.loglineText}>{pitchResult.logline}</Text>
                                </View>
                            </View>

                            <View style={styles.tagsContainer}>
                                <View style={[styles.tagBadge, { backgroundColor: colors.light.tag_default_bg, borderColor: colors.light.tag_default_text }]}>
                                    <Text style={[styles.tagText, { color: colors.light.tag_default_text }]}>#{pitchResult.genre.replace(/\s+/g, '')}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Custom Save Modal */}
                <Modal
                    visible={isSaveModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={toggleSaveModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                            <View style={styles.dragHandle} />
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Save Tether</Text>
                                <TouchableOpacity onPress={toggleSaveModal} style={styles.closeModalBtn}>
                                    <MaterialIcons name="close" size={24} color={colors.light.secondary_text} />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={styles.modalTextInput}
                                value={customTetherName}
                                onChangeText={setCustomTetherName}
                                placeholder="Name your tether..."
                                placeholderTextColor="#999"
                                autoFocus
                            />

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity
                                    style={[styles.premiumSaveBtn, { flex: 1, backgroundColor: colors.light.card, borderWidth: 1, borderColor: colors.light.border, shadowOpacity: 0, elevation: 0 }]}
                                    onPress={toggleSaveModal}
                                >
                                    <Text style={[styles.premiumSaveBtnText, { color: colors.light.primary_text }]}>CANCEL</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.premiumSaveBtn, { flex: 1 }]}
                                    onPress={handleSaveCollision}
                                >
                                    <Text style={styles.premiumSaveBtnText}>SAVE TO VAULT</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
        backgroundColor: 'rgba(248, 248, 246, 0.9)',
    },
    backBtn: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontFamily: typography.monoBold,
        fontSize: 13,
        color: colors.light.primary_text,
        letterSpacing: 1.5,
    },
    scrollContent: {
        padding: 24,
    },
    comboArea: {
        marginBottom: 24,
        gap: 12,
    },
    comboCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.light.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    comboText: {
        flex: 1,
        fontFamily: typography.mono,
        fontSize: 13,
        color: colors.light.secondary_text,
        marginRight: 12,
    },
    inlineTagBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    inlineTagText: {
        fontFamily: typography.monoBold,
        fontSize: 11,
        letterSpacing: 0.5,
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
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 20,
        minHeight: 60,
        color: colors.light.primary_text,
        marginBottom: 24,
    },
    premiumSaveBtn: {
        backgroundColor: colors.light.primary_btn,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.light.primary_btn,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    premiumSaveBtnText: {
        fontFamily: typography.monoBold,
        color: colors.light.primary_btn_text,
        fontSize: 14,
        letterSpacing: 1,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
        marginTop: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.light.card,
        borderRadius: 16,
        paddingVertical: 16,
        borderWidth: 1.5,
        borderColor: colors.light.border,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    actionBtnText: {
        fontFamily: typography.monoBold,
        fontSize: 12,
        color: colors.light.primary_text,
        letterSpacing: 1,
    },
    storyDraftContainer: {
        marginBottom: 24,
    },
    draftHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    draftTitleText: {
        fontFamily: typography.monoBold,
        fontSize: 12,
        color: colors.light.secondary_text,
        letterSpacing: 2,
    },
    versionBadge: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: colors.light.border,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    versionText: {
        fontFamily: typography.mono,
        fontSize: 10,
        color: colors.light.secondary_text,
    },
    paper: {
        backgroundColor: colors.light.paper_result,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    paperHeader: {
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        borderStyle: 'dashed',
        paddingBottom: 20,
        marginBottom: 24,
    },
    paperTitle: {
        fontFamily: typography.serif,
        fontSize: 24,
        fontWeight: '700',
        color: colors.light.primary_text,
        textAlign: 'center',
        marginBottom: 8,
    },
    paperSubtitle: {
        fontFamily: typography.mono,
        fontSize: 10,
        color: colors.light.secondary_text,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    paperContent: {
        backgroundColor: 'rgba(243, 244, 246, 0.5)',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    loglineLabel: {
        fontFamily: typography.monoBold,
        fontSize: 12,
        color: colors.light.primary_text,
        marginBottom: 8,
    },
    loglineText: {
        fontFamily: typography.mono,
        fontSize: 13,
        color: '#374151',
        lineHeight: 22,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 24,
    },
    tagBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light.card,
        borderWidth: 1,
        borderColor: colors.light.border,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    tagText: {
        fontFamily: typography.mono,
        fontSize: 12,
        color: colors.light.secondary_text,
    }
});
