import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const EscolhaScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Selecione seu perfil para começar:</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('LoginAluno')}>
        <Text style={styles.buttonText}>Aluno</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('LoginFuncionario')}>
        <Text style={styles.buttonText}>Funcionário</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C23B2D',
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  title: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  button: {
    width: '80%',
    paddingVertical: 15,
    backgroundColor: '#6B1E1E',
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EscolhaScreen;