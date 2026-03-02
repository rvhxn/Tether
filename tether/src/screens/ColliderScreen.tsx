import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Modal, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { fetchRandomIdeas, saveCollision } from '../services/api';
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
    const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
    const [customTetherName, setCustomTetherName] = useState('');
    const navigation = useNavigation<any>();

    const handleCollide = async () => {
        setIsColliding(true);
        try {
            // Artificial delay for "impact" feeling
            setTimeout(async () => {
                const ideas = await fetchRandomIdeas(numIdeas);
                setCollidedIdeas(ideas);
                setIsColliding(false);
            }, 600);
        } catch (error) {
            console.error(error);
            setIsColliding(false);
        }
    };

    const handlePitchNav = () => {
        if (collidedIdeas.length === 0) return;
        navigation.navigate('PitchResult', { ideas: collidedIdeas });
    };

    const toggleSaveModal = () => {
        setIsSaveModalVisible(!isSaveModalVisible);
        if (!isSaveModalVisible) {
            setCustomTetherName('');
        }
    };

    const handleSaveTether = async () => {
        if (!customTetherName.trim() || collidedIdeas.length === 0) return;

        const combinedText = collidedIdeas.map(i => i.content).join(' + ');
        const ideaIds = collidedIdeas.map(i => i.id);

        try {
            await saveCollision(
                ideaIds,
                combinedText,
                customTetherName.trim(),
                "No pitch generated.",
                "Custom Draft"
            );
            setIsSaveModalVisible(false);
            // Navigate to the Vault so user immediately sees their saved Tether
            navigation.navigate('Vault');
        } catch (error) {
            console.error("Failed to save to vault:", error);
        }
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
                                <View style={styles.actionRow}>
                                    <TouchableOpacity style={[styles.pitchBtn, { flex: 1.5 }]} onPress={handlePitchNav}>
                                        <MaterialIcons name="auto-awesome" size={20} color={colors.light.primary_btn_text} />
                                        <Text style={styles.pitchBtnText}>GENERATE PITCH</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.pitchBtn, styles.saveSecondaryBtn]} onPress={toggleSaveModal}>
                                        <MaterialIcons name="bookmark" size={20} color={colors.light.primary_text} />
                                        <Text style={[styles.pitchBtnText, { color: colors.light.primary_text }]}>SAVE</Text>
                                    </TouchableOpacity>
                                </View>
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
                                    onPress={handleSaveTether}
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
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    pitchBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.light.primary_btn,
        paddingVertical: 18,
        borderRadius: 30,
        gap: 8,
    },
    saveSecondaryBtn: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderWidth: 2, // made border thicker so it stands out
        borderColor: colors.light.primary_btn, // match primary theme color
    },
    pitchBtnText: {
        fontFamily: typography.monoBold,
        fontSize: 14,
        color: colors.light.primary_btn_text,
        letterSpacing: 1,
    },
    controlsContainer: {
        paddingHorizontal: 24,
        paddingTop: 16,
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
        backgroundColor: colors.light.card,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: colors.light.border,
        paddingHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 6,
    },
    stepperBtn: {
        padding: 12,
    },
    stepperText: {
        fontFamily: typography.monoBold,
        fontSize: 20,
        width: 28,
        textAlign: 'center',
        color: colors.light.primary_text,
    },
    collideBtn: {
        flex: 1,
        backgroundColor: colors.light.primary_btn,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.light.primary_btn,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    collideBtnActive: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    collideBtnText: {
        fontFamily: typography.monoBold,
        fontSize: 18,
        color: colors.light.primary_btn_text,
        letterSpacing: 2,
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
        color: colors.light.primary_text,
        marginBottom: 32,
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
    }
});
