import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
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
    const [pitchResult, setPitchResult] = useState<{ title: string; logline: string } | null>(null);

    const handleGeneratePitch = async () => {
        if (GEMINI_API_KEY === "dummy-api-key-for-mvp") {
            // Mock result if no real key is provided yet
            setIsGenerating(true);
            setTimeout(() => {
                setPitchResult({
                    title: "The Chlorophyll Protocol",
                    logline: "In a rain-slicked 2084 Tokyo, a retired botanist must pull off the ultimate heist: stealing the consciousness of the world's last naturally growing tree."
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

    const handleSaveCollision = async () => {
        try {
            const ideaIds = ideas.map(i => i.id);
            const combinedText = ideas.map(i => i.content).join('\n---\n');

            await saveCollision(
                ideaIds,
                combinedText,
                pitchResult?.title,
                pitchResult?.logline,
                "#Draft" // Default tag
            );

            Alert.alert('Saved!', 'The tether has been safely stored in your Vault.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
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
                        {ideas.map((idea, index) => (
                            <View
                                key={`${idea.id}-${index}`}
                                style={[
                                    styles.comboCard,
                                    { transform: [{ scale: 1 - (index * 0.05) }, { translateY: index * -8 }], zIndex: 10 - index }
                                ]}
                            >
                                <MaterialIcons name="psychology" size={18} color={colors.light.secondary_text} style={{ marginRight: 8 }} />
                                <Text style={styles.comboText} numberOfLines={1}>
                                    {idea.content}
                                </Text>
                            </View>
                        ))}
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
                            <Text style={styles.actionBtnText}>{pitchResult ? 'RE-PITCH' : 'GENERATE PITCH'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionBtn} onPress={handleSaveCollision}>
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
                                    <Text style={[styles.tagText, { color: colors.light.tag_default_text }]}>#SciFi</Text>
                                </View>
                                <View style={[styles.tagBadge, { backgroundColor: colors.light.tag_character_bg, borderColor: colors.light.tag_character_text }]}>
                                    <Text style={[styles.tagText, { color: colors.light.tag_character_text }]}>#Noir</Text>
                                </View>
                                <View style={[styles.tagBadge, { backgroundColor: colors.light.highlighter_yellow_bg, borderColor: colors.light.highlighter_yellow_border }]}>
                                    <MaterialIcons name="bolt" size={12} color={colors.light.highlighter_yellow_text} style={{ marginRight: 4 }} />
                                    <Text style={[styles.tagText, { color: colors.light.highlighter_yellow_text }]}>High Voltage</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>
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
        fontFamily: typography.mono,
        fontSize: 13,
        fontWeight: '700',
        color: colors.light.primary_text,
        letterSpacing: 1.5,
    },
    scrollContent: {
        padding: 24,
    },
    comboArea: {
        alignItems: 'center',
        marginBottom: 32,
        minHeight: 80,
    },
    comboCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.light.border,
        paddingHorizontal: 16,
        height: 60,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        position: 'absolute',
    },
    comboText: {
        flex: 1,
        fontFamily: typography.mono,
        fontSize: 13,
        color: colors.light.secondary_text,
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
        fontFamily: typography.mono,
        fontSize: 12,
        fontWeight: '800',
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
        fontFamily: typography.mono,
        fontSize: 12,
        fontWeight: '800',
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
        fontFamily: typography.mono,
        fontSize: 12,
        fontWeight: '800',
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
        fontWeight: '500',
    }
});
