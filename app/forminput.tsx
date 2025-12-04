import React from 'react';
import { StyleSheet, TextInput, Text, Button, View } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';


const TextInputExample = () => {
    const [text, onChangeText] = React.useState('Useless Text');
    const [number, onChangeNumber] = React.useState('');

    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <Stack.Screen options={{ title: 'Form Input' }} />
                <Text style={styles.inputTitle}>Nama</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={onChangeText}
                />
                <Text style={styles.inputTitle}>NIM</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={onChangeNumber}

                />
                <Text style={styles.inputTitle}>Kelas</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={onChangeNumber}
                />
                <View style={styles.button}>
                    <Button
                        title="Submit"
                        onPress={() =>alert('Simple Button pressed')}
                    />
                </View>


            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
    },
    inputTitle: {
        fontSize: 16,
        marginLeft: 12,
        marginTop: 12,
        fontWeight: '600',
    },
    button: {
        marginTop: 20,
        marginHorizontal: 12,
        backgroundColor: '#0275d8',
        padding: 10,
        borderRadius: 5,
    },
});

export default TextInputExample;