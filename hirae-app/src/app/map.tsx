import { useCallback, useRef, useState } from 'react';
import { View, Pressable, Animated, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Mapbox, {
    MapView,
    Camera,
    MarkerView,
    ShapeSource,
    FillLayer,
    LineLayer,
} from '@rnmapbox/maps';
import NavigationBar from '@/components/navigation-bar';
import { ThemedText } from '@/components/themed-text';
import { getNearbyLandmarks } from '@/data/landmarks';
import type { Landmark } from '@/types/landmark';
import { formatDistance, formatElapsed } from '@/utils/format';
import { useTracking } from '@/context/tracking-context';
import { useElapsed } from '@/hooks/use-elapsed';
import { Colors, Fonts, Radius, ScreenPadding } from '@/constants/theme';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '');

const CAPTURE_RADIUS_M = 75;
const SHEET_COLLAPSED = 64;
const SHEET_EXPANDED = Dimensions.get('window').height * 0.42;

export default function MapScreen() {
    const [landmarks, setLandmarks] = useState<Landmark[]>([]);
    const [expanded, setExpanded] = useState(false);

    const {
        coords,
        visitedArea,
        error: locationError,
        sessionState,
        startedAt,
        latestTimestamp,
        savedNotice,
        mockMode,
        setMockMode,
        resetTracking,
    } = useTracking();

    const elapsed = useElapsed(startedAt, mockMode ? latestTimestamp : undefined);

    const sheetHeight = useRef(new Animated.Value(SHEET_COLLAPSED)).current;
    const cameraRef = useRef<React.ElementRef<typeof Camera>>(null);

    useFocusEffect(
        useCallback(() => {
            getNearbyLandmarks().then(setLandmarks);
        }, [])
    );

    const nearest = landmarks[0];
    const canCapture = nearest ? nearest.distanceMeters <= CAPTURE_RADIUS_M : false;

    const recenter = () => {
        if (!coords) return;
        cameraRef.current?.setCamera({
            centerCoordinate: coords,
            zoomLevel: 17,
            animationDuration: 600,
        });
    };

    const toggleSheet = () => {
        const next = !expanded;
        setExpanded(next);
        Animated.spring(sheetHeight, {
            toValue: next ? SHEET_EXPANDED : SHEET_COLLAPSED,
            useNativeDriver: false,
            friction: 9,
            tension: 60,
        }).start();
    };

    return (
        <View style={styles.root}>
            <MapView style={styles.map} styleURL={Mapbox.StyleURL.Light}>
                {visitedArea && (
                    <ShapeSource id="visited" shape={visitedArea}>
                        <FillLayer
                            id="visited-fill"
                            style={{
                                fillColor: Colors.primary,
                                fillOpacity: 0.18,
                            }}
                        />
                        <LineLayer
                            id="visited-outline"
                            style={{
                                lineColor: Colors.primary,
                                lineWidth: 1.5,
                                lineOpacity: 0.5,
                            }}
                        />
                    </ShapeSource>
                )}

                {coords && (
                    <>
                        <Camera
                            ref={cameraRef}
                            zoomLevel={17}
                            centerCoordinate={coords}
                            animationDuration={1800}
                            animationMode="easeTo"
                        />
                        <MarkerView coordinate={coords} anchor={{ x: 0.5, y: 0.5 }}>
                            <View style={styles.userDotOuter}>
                                <View style={styles.userDot} />
                            </View>
                        </MarkerView>
                    </>
                )}
            </MapView>

            <View style={styles.topOverlay}>
                <Pressable style={styles.sessionPill} onPress={recenter}>
                    <View
                        style={[
                            styles.pulseDot,
                            sessionState === 'idle' && styles.pulseDotIdle,
                        ]}
                    />
                    <ThemedText style={styles.sessionText}>
                        {sessionState === 'active'
                            ? `wandering · ${formatElapsed(elapsed)}`
                            : 'not wandering'}
                    </ThemedText>
                </Pressable>

                <View style={styles.scopeBlock}>
                    <View style={styles.percentRow}>
                        <ThemedText style={styles.percentValue}>32</ThemedText>
                        <ThemedText style={styles.percentUnit}>%</ThemedText>
                    </View>
                    <ThemedText style={styles.scopeLabel}>San Francisco ▾</ThemedText>
                </View>
            </View>

            {(locationError || savedNotice) && (
                <View style={styles.errorPill}>
                    <ThemedText style={styles.errorText}>
                        {savedNotice ?? locationError}
                    </ThemedText>
                </View>
            )}

            <Animated.View style={[styles.floatingButtons, { bottom: sheetHeight }]}>
                <Pressable
                    style={[styles.iconButton, mockMode && styles.iconButtonActive]}
                    onPress={() => setMockMode(!mockMode)}>
                    <MaterialCommunityIcons
                        name="walk"
                        size={22}
                        color={mockMode ? Colors.background : Colors.primary}
                    />
                </Pressable>
                <Pressable style={styles.iconButton} onPress={() => { }}>
                    <MaterialCommunityIcons name="note-text-outline" size={22} color={Colors.primary} />
                </Pressable>
                <Pressable
                    style={[styles.iconButton, !canCapture && styles.iconButtonDisabled]}
                    disabled={!canCapture}
                    onPress={() => { }}>
                    <MaterialCommunityIcons
                        name="camera-outline"
                        size={22}
                        color={canCapture ? Colors.primary : Colors.secondary}
                    />
                </Pressable>
                {__DEV__ && (
                    <Pressable style={styles.iconButton} onPress={resetTracking}>
                        <MaterialCommunityIcons
                            name="delete-outline"
                            size={22}
                            color={Colors.accent}
                        />
                    </Pressable>
                )}
            </Animated.View>

            <Animated.View style={[styles.sheet, { height: sheetHeight }]}>
                <Pressable style={styles.handleArea} onPress={toggleSheet} hitSlop={10}>
                    <View style={styles.handle} />
                </Pressable>

                {expanded && (
                    <>
                        <ThemedText style={styles.sheetTitle}>NEARBY LANDMARKS</ThemedText>
                        <ScrollView
                            style={styles.list}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}>
                            {landmarks.map((landmark, index) => (
                                <View key={landmark.id}>
                                    {index > 0 && <View style={styles.rowDivider} />}
                                    <Pressable
                                        style={styles.landmarkRow}
                                        disabled={!landmark.discovered}
                                        onPress={() => { }}>
                                        <View style={styles.thumb} />
                                        <View style={styles.landmarkText}>
                                            <ThemedText
                                                style={[styles.landmarkName, !landmark.discovered && styles.dimmed]}>
                                                {landmark.name}
                                            </ThemedText>
                                            <ThemedText
                                                style={[styles.landmarkMeta, !landmark.discovered && styles.dimmed]}>
                                                {formatDistance(landmark.distanceMeters)} away
                                            </ThemedText>
                                        </View>
                                    </Pressable>
                                </View>
                            ))}
                        </ScrollView>
                        <NavigationBar />
                    </>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.secondary },
    map: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    topOverlay: {
        position: 'absolute',
        top: 60,
        left: ScreenPadding,
        right: ScreenPadding,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    sessionPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: Colors.surface,
        borderRadius: Radius.pill,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    errorPill: {
        position: 'absolute',
        top: 130,
        left: ScreenPadding,
        right: ScreenPadding,
        backgroundColor: Colors.surface,
        borderRadius: Radius.card,
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    errorText: { fontFamily: Fonts.medium, fontSize: 13, textAlign: 'center' },
    pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
    pulseDotIdle: { backgroundColor: Colors.secondary },
    sessionText: { fontFamily: Fonts.medium, fontSize: 12 },

    scopeBlock: { alignItems: 'flex-end' },
    percentRow: { flexDirection: 'row', alignItems: 'baseline' },
    percentValue: { fontFamily: Fonts.bold, fontSize: 38, lineHeight: 46 },
    percentUnit: { fontFamily: Fonts.semibold, fontSize: 18, lineHeight: 22 },
    scopeLabel: { fontFamily: Fonts.semibold, fontSize: 13, marginTop: -8 },

    userDotOuter: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(123, 140, 196, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: Colors.landmark,
        borderWidth: 2.5,
        borderColor: Colors.surface,
    },

    floatingButtons: {
        position: 'absolute',
        right: ScreenPadding,
        gap: 10,
        marginBottom: 16,
    },
    iconButton: {
        width: 52,
        height: 52,
        borderRadius: Radius.card,
        backgroundColor: Colors.surfaceHalf,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButtonDisabled: { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
    iconButtonActive: { backgroundColor: Colors.primary },

    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.background,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
    },
    handleArea: { alignItems: 'center', paddingVertical: 14 },
    handle: { width: 46, height: 4, borderRadius: 2, backgroundColor: Colors.border },

    sheetTitle: {
        fontFamily: Fonts.semibold,
        fontSize: 13,
        letterSpacing: 1,
        textAlign: 'center',
        marginBottom: 10,
    },
    list: { flex: 1 },
    listContent: { paddingHorizontal: ScreenPadding },
    rowDivider: { height: 1, backgroundColor: Colors.border },
    landmarkRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
    thumb: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.secondary },
    landmarkText: { flex: 1, gap: 2 },
    landmarkName: { fontFamily: Fonts.semibold, fontSize: 15 },
    landmarkMeta: { fontFamily: Fonts.regular, fontSize: 12 },
    dimmed: { opacity: 0.45 },
});