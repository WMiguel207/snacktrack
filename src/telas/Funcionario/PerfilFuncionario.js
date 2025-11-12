import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import FooterNavFuncionario from '../../../components/FooterNavFuncionario';
import { useNavigation } from '@react-navigation/native';

export default function PerfilFuncionario() {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState('Perfil'); // <-- define activeTab

  const usuario = {
    nome: 'Nome',
    email: 'user123@funcionario.senai.com.br',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={require('../../../assets/item3.png')}
          style={styles.avatar}
        />
        <Text style={styles.name}>{usuario.nome}</Text>
        <Text style={styles.email}>{usuario.email}</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('Avaliacoes')}>
          <Text style={styles.optionText}>Avaliações</Text>
          <Icon name="chevron-right" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => navigation.navigate('Codigos')}>
          <Text style={styles.optionText}>Códigos</Text>
          <Icon name="chevron-right" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, styles.logoutOption]}
          onPress={() => navigation.navigate('Escolha')}>
          <Text style={[styles.optionText, styles.logoutText]}>Sair</Text>
          <Icon name="logout" size={24} color="#c00" />
        </TouchableOpacity>
      </View>

      <FooterNavFuncionario activeTab={activeTab} setActiveTab={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  profileContainer: { alignItems: 'center', marginVertical: 30 },
  avatar: {
    width: 180,
    height: 180,
    borderRadius: 100,
    backgroundColor: '#ccc',
  },
  name: { marginTop: 10, fontWeight: 'bold', fontSize: 16 },
  email: { color: '#555', marginTop: 2 },
  optionsContainer: { paddingBottom: 20 },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: { fontSize: 16 },
  logoutOption: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 20,
  },
  logoutText: {
    color: '#c00',
    fontWeight: 'bold',
  },
});
