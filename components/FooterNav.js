import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function FooterNav() {
  const navigation = useNavigation();
  const route = useRoute();
  const tabs = [
    { name: "PerfilAluno", icon: "person" },
    { name: "InicioAluno", icon: "home" },
    { name: "Buscas", icon: "search" },
  ];

  return (
    <View style={styles.footer}>
      {tabs.map((tab) => {
        const isActive = route.name === tab.name;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.footerBtn}
            onPress={() => navigation.navigate(tab.name)}
          >
            <View style={[styles.iconCircle, isActive && styles.activeCircle]}>
              <Icon
                name={tab.icon}
                size={tab.name === "InicioAluno" ? 32 : 28}
                color={isActive ? "#c1372d" : "#fff"}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginBottom: 50,
    height: 60,
    backgroundColor: "#c1372d",
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    margin: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  footerBtn: {
    flex: 1,
    alignItems: "center",
  },
  iconCircle: {
    backgroundColor: "transparent",
    borderRadius: 30,
    padding: 10,
  },
  activeCircle: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 10,
  },
});
