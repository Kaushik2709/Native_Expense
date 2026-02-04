import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    Pressable
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';

interface EditProfileModalProps {
    isVisible: boolean;
    onClose: () => void;
    currentUser: any;
    onUpdateSuccess: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
    isVisible,
    onClose,
    currentUser,
    onUpdateSuccess
}) => {
    const [fullName, setFullName] = useState(currentUser?.user_metadata?.full_name || '');
    const [avatarUrl, setAvatarUrl] = useState(currentUser?.user_metadata?.avatar_url || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFullName(currentUser.user_metadata?.full_name || '');
            setAvatarUrl(currentUser.user_metadata?.avatar_url || '');
        }
    }, [currentUser, isVisible]);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const uploadImage = async (uri: string) => {
        try {
            setUploading(true);

            // Get file extension
            const ext = uri.split('.').pop();
            const fileName = `${currentUser.id}/${Date.now()}.${ext}`;

            const formData = new FormData();
            const file = {
                uri,
                name: fileName,
                type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
            } as any;

            // Note: You must have an 'avatars' bucket created in Supabase with public access
            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (error) {
                console.error('Supabase storage error:', error);
                throw error;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            setAvatarUrl(publicUrl);
        } catch (error: any) {
            console.error('Upload error:', error);
            Alert.alert('Upload Failed', 'Make sure you have an "avatars" bucket in Supabase storage.\n\n' + (error.message || ''));
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Error', 'Full name cannot be empty');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName.trim(),
                    avatar_url: avatarUrl,
                },
            });

            if (error) throw error;

            onUpdateSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={isVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <Pressable style={styles.dismissArea} onPress={onClose} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.pullBar} />

                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-8">
                            <View>
                                <Text className="text-2xl font-bold text-gray-900">Edit Profile</Text>
                                <Text className="text-gray-500 text-sm mt-1">Update your public information</Text>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                            >
                                <MaterialIcons name="close" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
                            {/* Profile Picture Section */}
                            <View className="items-center mb-10">
                                <TouchableOpacity onPress={pickImage} activeOpacity={0.9} className="relative">
                                    <View className="w-28 h-28 rounded-full bg-purple-50 p-1 items-center justify-center overflow-hidden border-2 border-purple-100 shadow-sm">
                                        {uploading ? (
                                            <ActivityIndicator size="small" color="#7B61FF" />
                                        ) : avatarUrl ? (
                                            <Image source={{ uri: avatarUrl }} className="w-full h-full rounded-full" />
                                        ) : (
                                            <Text className="text-purple-600 text-4xl font-bold">
                                                {(fullName?.[0] || currentUser?.email?.[0] || 'U').toUpperCase()}
                                            </Text>
                                        )}
                                    </View>
                                    <View className="absolute bottom-0 right-0 bg-purple-600 w-9 h-9 rounded-full items-center justify-center border-4 border-white shadow-md">
                                        <MaterialIcons name="camera-alt" size={18} color="white" />
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={pickImage} className="mt-4">
                                    <Text className="text-purple-600 font-semibold">Change Photo</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Form Fields */}
                            <View className="space-y-6">
                                <View>
                                    <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Full Name</Text>
                                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-1">
                                        <MaterialIcons name="person-outline" size={20} color="#9ca3af" style={{ marginRight: 8 }} />
                                        <TextInput
                                            className="flex-1 py-3 text-gray-900 text-base"
                                            placeholder="Enter your name"
                                            placeholderTextColor="#9ca3af"
                                            value={fullName}
                                            onChangeText={setFullName}
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">Email Address</Text>
                                    <View className="flex-row items-center bg-gray-100 border border-gray-200 rounded-2xl px-4 py-4 opacity-70">
                                        <MaterialIcons name="mail-outline" size={20} color="#9ca3af" style={{ marginRight: 8 }} />
                                        <Text className="text-gray-500 text-base ml-2">{currentUser?.email}</Text>
                                    </View>
                                    <Text className="text-gray-400 text-xs mt-2 ml-1">Email cannot be changed</Text>
                                </View>
                            </View>

                            <View className="h-10" />
                        </ScrollView>

                        {/* Action Buttons */}
                        <View className="pt-2">
                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={loading || uploading}
                                activeOpacity={0.8}
                                className={`bg-purple-600 py-4 rounded-2xl items-center shadow-lg ${(loading || uploading) ? 'opacity-50' : ''
                                    }`}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text className="text-white font-bold text-lg">Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    dismissArea: {
        flex: 1,
    },
    keyboardView: {
        width: '100%',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        padding: 28,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 44 : 28,
        maxHeight: '90%',
    },
    pullBar: {
        width: 40,
        height: 5,
        backgroundColor: '#e5e7eb',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
});

export default EditProfileModal;
