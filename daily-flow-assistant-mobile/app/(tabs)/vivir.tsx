import { StyleSheet, View, Modal, Pressable, TextInput, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect, useState } from 'react';
import { getCurrentActivity, getTodaySchedule, calculateProgress } from '../../services/ScheduleService';
import { ScheduledActivity } from '../../types';
import { Audio } from 'expo-av';
import ProgressBar from '@/components/ProgressBar';

const audioAsset = require('../../assets/audio/Eminem - Lose Yourself [HD] (1).mp3');

export default function VivirScreen() {
  const [currentActivity, setCurrentActivity] = useState<ScheduledActivity | null>(null);
  const [progress, setProgress] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [userText, setUserText] = useState('');
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const updateScreenData = () => {
    setCurrentActivity(getCurrentActivity());
    setProgress(calculateProgress());
  };

  useEffect(() => {
    updateScreenData();
    const interval = setInterval(updateScreenData, 60000); // Update every minute

    return () => {
      clearInterval(interval);
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playSound = async () => {
    Alert.alert('Apoyo en Camino', 'Entendido. Reproduciendo ahora...');
    
    console.log('Loading Sound');
    const { sound: newSound } = await Audio.Sound.createAsync(audioAsset);
    setSound(newSound);

    console.log('Playing Sound');
    await newSound.playAsync();
  };

  const handleHelpPress = () => {
    playSound();
    setUserText('');
    setModalVisible(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ProgressBar progress={progress} />
      
      {/* Current Activity Display */}
      <ThemedText type="title">Pilar: Vivir</ThemedText>
      <View style={styles.activityContainer}>
        {currentActivity ? (
          <>
            <ThemedText type="subtitle">Actividad Actual:</ThemedText>
            <ThemedText style={styles.activityName}>{currentActivity.activity}</ThemedText>
            <ThemedText style={styles.activityFocus}>{currentActivity.focus}</ThemedText>
          </>
        ) : (
          <ThemedText>No hay actividad programada en este momento.</ThemedText>
        )}
      </View>

      {/* Help Button */}
      <Pressable style={styles.helpButton} onPress={() => setModalVisible(true)}>
        <ThemedText style={styles.helpButtonText}>Botón de Auxilio</ThemedText>
      </Pressable>

      {/* Help Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <ThemedText type="subtitle" style={styles.modalTitle}>¿Cómo te sientes?</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Escribe aquí lo que sientes o necesitas..."
              onChangeText={setUserText}
              value={userText}
              multiline
            />
            <Pressable style={styles.modalButton} onPress={handleHelpPress}>
              <ThemedText style={styles.modalButtonText}>Pedir Ayuda</ThemedText>
            </Pressable>
            <Pressable style={[styles.modalButton, styles.closeButton]} onPress={() => setModalVisible(false)}>
              <ThemedText style={styles.modalButtonText}>Cerrar</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  activityContainer: {
    marginBottom: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  activityName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activityFocus: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
  },
  helpButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#c0392b',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#27ae60',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#7f8c8d',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
