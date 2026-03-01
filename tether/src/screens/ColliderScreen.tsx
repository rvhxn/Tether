import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { getRandomIdeas } from '../database/db';
import { useNavigation } from '@react-navigation/native';

type Idea = {
    id: number;
    content: string;
    type: string;
    created_at: string;
};

export default function ColliderScreen() {
    const insets = useSafeAreaInsets();
    const [numIdeas, setNumIdeas] = useState(2);
    const [collidedIdeas, setCollidedIdeas] = useState<Idea[]>([]);
    const [isColliding, setIsColliding] = useState(false);
    const navigation = useNavigation<any>();

    const handleCollide = async () => {
        setIsColliding(true);
        // Add brief artificial delay for the "impact" feeling
        setTimeout(async () => {
            const ideas = await getRandomIdeas(numIdeas);
            setCollidedIdeas(ideas);
            setIsColliding(false);
        }, 600);
    };

    const handlePitchNav = () => {
        if (collidedIdeas.length === 0) return;
        navigation.navigate('PitchResult', { ideas: collidedIdeas });
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

    return (
        <View style={styles.safeArea}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Tether</Text>
                    <Text style={styles.headerSubtitle}>Combine ideas together</Text>
                </View>

                <ScrollView contentContainerStyle={[styles.impactZone, { paddingBottom: 120 }]}>
                    {collidedIdeas.length === 0 && !isColliding ? (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="bolt" size={64} color={colors.light.border} />
                            <Text style={styles.emptyText}>Select ideas to synthesize.</Text>
                        </View>
                    ) : (
                        <View style={{ gap: 16 }}>
                            {collidedIdeas.map((idea, index) => {
                                const tagStyles = getTagStyles(idea.type);
                                return (
                                    <View key={`${idea.id}-${index}`} style={styles.ideaCard}>
                                        <View style={styles.cardHeader}>
                                            <View style={[styles.tagBadge, { backgroundColor: tagStyles.bg }]}>
                                                <Text style={[styles.tagText, { color: tagStyles.text }]}>{idea.type.toUpperCase()}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.cardContent}>{idea.content}</Text>
                                    </View>
                                );
                            })}

                            {collidedIdeas.length > 0 && (
                                <TouchableOpacity style={styles.pitchBtn} onPress={handlePitchNav}>
                                    <MaterialIcons name="auto-awesome" size={20} color={colors.light.primary_btn_text} />
                                    <Text style={styles.pitchBtnText}>GENERATE PITCH</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </ScrollView>

                <View style={[styles.controlsContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                    <View style={styles.stepperContainer}>
                        <TouchableOpacity
                            style={styles.stepperBtn}
                            onPress={() => setNumIdeas(Math.max(2, numIdeas - 1))}
                        >
                            <MaterialIcons name="remove" size={24} color={colors.light.primary_text} />
                        </TouchableOpacity>
                        <Text style={styles.stepperText}>{numIdeas}</Text>
                        <TouchableOpacity
                            style={styles.stepperBtn}
                            onPress={() => setNumIdeas(Math.min(5, numIdeas + 1))}
                        >
                            <MaterialIcons name="add" size={24} color={colors.light.primary_text} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.collideBtn, isColliding && styles.collideBtnActive]}
                        onPress={handleCollide}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.collideBtnText}>
                            {isColliding ? 'TETHERING...' : 'TETHER'}
                        </Text>
                    </TouchableOpacity>
                </View>
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
        alignItems: 'center',
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
    impactZone: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.5,
    },
    emptyText: {
        fontFamily: typography.mono,
        fontSize: 14,
        color: colors.light.secondary_text,
        marginTop: 16,
    },
    ideaCard: {
        backgroundColor: colors.light.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.light.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardHeader: {
        marginBottom: 12,
    },
    tagBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        fontFamily: typography.mono,
        fontSize: 10,
        letterSpacing: 0.5,
    },
    cardContent: {
        fontFamily: typography.mono,
        fontSize: 16,
        lineHeight: 24,
        color: colors.light.primary_text,
    },
    pitchBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.light.primary_btn,
        paddingVertical: 18,
        borderRadius: 30,
        marginTop: 16,
        gap: 8,
    },
    pitchBtnText: {
        fontFamily: typography.mono,
        fontWeight: '800',
        fontSize: 14,
        color: colors.light.primary_btn_text,
        letterSpacing: 1,
    },
    controlsContainer: {
        padding: 24,
        backgroundColor: colors.light.card,
        borderTopWidth: 1,
        borderTopColor: colors.light.border,
        flexDirection: 'row',
        gap: 16,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.light.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.light.border,
        paddingHorizontal: 8,
    },
    stepperBtn: {
        padding: 12,
    },
    stepperText: {
        fontFamily: typography.mono,
        fontSize: 20,
        fontWeight: '700',
        width: 28,
        textAlign: 'center',
        color: colors.light.primary_text,
    },
    collideBtn: {
        flex: 1,
        backgroundColor: colors.light.primary_btn,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    collideBtnActive: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    collideBtnText: {
        fontFamily: typography.mono,
        fontSize: 18,
        fontWeight: '800',
        color: colors.light.primary_btn_text,
        letterSpacing: 2,
    }
});
