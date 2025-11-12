import React, { useState } from 'react';
import {
  View,
  Modal,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Alert } from 'react-native';

const cardapio = [
  {
    id: '1',
    titulo: 'Opção 1',
    descricao: 'Macarrão cozido com molho de tomate, alho e ervas.',
    nota: '5.0',
    imagem: require('../../../assets/item1.png'),
  },
  {
    id: '2',
    titulo: 'Opção 2',
    descricao: 'Filé de frango grelhado, servido com arroz e legumes.',
    nota: '5.0',
    imagem: require('../../../assets/item2.png'),
  },
  {
    id: '3',
    titulo: 'Opção 3',
    descricao:
      'Sanduíche de queijo derretido, servido com salada e batata frita.',
    nota: '5.0',
    imagem: require('../../../assets/item3.png'),
  },
  {
    id: '4',
    titulo: 'Opção 4',
    descricao:
      'Feijoada tradicional brasileira, servida com arroz, farofa e couve.',
    nota: '5.0',
    imagem: require('../../../assets/item2.png'),
  },
];

export default function CardapioFuncionario2() {
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPrato, setSelectedPrato] = useState(null);

  const renderItem = ({ item }) => (
    <View style={styles.card}>

      <View style={styles.info}>
        <View style={styles.topo}>
          <Text style={styles.nome}>{item.titulo}</Text>

          <TouchableOpacity
            style={styles.btnReservar}
            onPress={() => {
              setSelectedPrato(item);
              setModalVisible(true);
            }}>
            <Text style={styles.txtReservar}>Editar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.descricao}>{item.descricao}</Text>

        <Text style={styles.nota}>⭐ {item.nota}</Text>
      </View>

      <Image source={item.imagem} style={styles.imagem} />
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#f5f5f5', paddingTop: 75 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('CardapioFuncionario')}>
          <Icon name="arrow-back-ios" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.titulo}>CARDÁPIO DO DIA</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={cardapio}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  imagem: {
    width: 100,
    height: 100,
    borderRadius: 100,
    marginLeft: 10,
  },
  info: {
    flex: 1,
    marginHorizontal: 8,
  },
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nome: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  descricao: {
    fontSize: 13,
    color: '#666',
    marginVertical: 4,
  },
  nota: {
    fontSize: 13,
    color: '#f1c40f',
  },
  btnReservar: {
    backgroundColor: '#eee',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  txtReservar: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#555',
  },
});
