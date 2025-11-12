import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";
import { auth, db } from "../../../components/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const ModalReserva = ({ modalVisible, setModalVisible, selectedPrato, salvarReserva }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHour, setSelectedHour] = useState("12:00");

  const handleConfirmar = async () => {
    if (!selectedDate) {
      Alert.alert("Selecione uma data");
      return;
    }

    const usuarioUid = auth.currentUser?.uid;
    if (!usuarioUid) {
      Alert.alert("Usuário não autenticado.");
      return;
    }

    const dataEntrega = selectedDate;
    const horaEntrega = selectedHour;

    await salvarReserva(selectedPrato, dataEntrega, horaEntrega);
    setModalVisible(false);
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {`Escolha a data e hora para ${selectedPrato?.nome ? String(selectedPrato.nome) : "o item"}`}
          </Text>

          {/* Calendário */}
          <Calendar
            minDate={new Date().toISOString().split("T")[0]}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            style={{ marginBottom: 20 }}
          />

          {/* Seletor de hora */}
          <Text style={styles.label}>Selecione o horário:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedHour}
              onValueChange={(itemValue) => setSelectedHour(itemValue)}
              style={{ width: "100%" }}
            >
              <Picker.Item label="10:00" value="10:00" />
              <Picker.Item label="11:00" value="11:00" />
              <Picker.Item label="12:00" value="12:00" />
              <Picker.Item label="13:00" value="13:00" />
              <Picker.Item label="14:00" value="14:00" />
            </Picker>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmar}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Confirmar Reserva</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setModalVisible(false)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ModalReserva;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 16,
    width: "85%",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontWeight: "600",
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
    overflow: "hidden",
  },
  confirmButton: {
    backgroundColor: "#2e7d32",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  modalClose: {
    backgroundColor: "#b71c1c",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
