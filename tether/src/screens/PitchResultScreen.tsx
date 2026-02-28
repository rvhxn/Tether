import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
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

            Alert.alert('Saved!', 'The collision has been safely stored in your Vault.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Could not save the collision.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.light.primary_text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>TETHER RESULTS</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
                <View style={styles.comboArea}>
                    {ideas.map((idea, index) => (
                        <View
                            key={`${idea.id}-${index}`}
                            style={[
                                styles.comboCard,
                                { transform: [{ scale: 1 - (index * 0.05) }, { translateY: index * -10 }], zIndex: 10 - index }
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
                        <Text style={styles.actionBtnText}>{pitchResult ? 'Re-Pitch' : 'Generate Pitch'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={handleSaveCollision}>
                        <MaterialIcons name="bookmark" size={20} color={colors.light.secondary_text} />
                        <Text style={styles.actionBtnText}>Save</Text>
                    </TouchableOpacity>
                </View>

                {pitchResult && (
                    <View style={styles.storyDraftContainer}>
                        <View style={styles.draftHeader}>
                            <Text style={styles.draftTitleText}>Story Draft</Text>
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
                            <View style={styles.tagBadge}>
                                <Text style={styles.tagText}>#SciFi</Text>
                            </View>
                            <View style={styles.tagBadge}>
                                <Text style={styles.tagText}>#Noir</Text>
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
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
        backgroundColor: 'rgba(248, 248, 246, 0.9)',
    },
    backBtn: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontFamily: typography.sans,
        fontSize: 12,
        fontWeight: '600',
        color: colors.light.primary_text,
        letterSpacing: 2,
        opacity: 0.7,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 60,
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
        fontFamily: typography.sans,
        fontSize: 14,
        fontWeight: '500',
        color: colors.light.secondary_text,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
        marginTop: 20, // push down below Absolute cards
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.light.card,
        borderRadius: 30,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: colors.light.border,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    actionBtnText: {
        fontFamily: typography.sans,
        fontSize: 14,
        fontWeight: '500',
        color: colors.light.primary_text,
    },
    storyDraftContainer: {
        marginBottom: 24,
    },
    draftHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    draftTitleText: {
        fontFamily: typography.sans,
        fontSize: 12,
        fontWeight: '700',
        color: colors.light.secondary_text,
        letterSpacing: 2,
        textTransform: 'uppercase',
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
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    paperHeader: {
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        borderStyle: 'dashed',
        paddingBottom: 16,
        marginBottom: 20,
    },
    paperTitle: {
        fontFamily: typography.serif,
        fontSize: 22,
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
    },
    paperContent: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    loglineLabel: {
        fontFamily: typography.mono,
        fontSize: 12,
        fontWeight: '700',
        color: colors.light.primary_text,
        marginBottom: 4,
    },
    loglineText: {
        fontFamily: typography.mono,
        fontSize: 12,
        color: '#374151',
        lineHeight: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 20,
    },
    tagBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light.card,
        borderWidth: 1,
        borderColor: colors.light.border,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tagText: {
        fontFamily: typography.mono,
        fontSize: 12,
        color: colors.light.secondary_text,
    }
});
