import React from 'react';
import { StyleSheet, Text, View, Image, ImageBackground } from 'react-native';
export default function SplashScreen() {
  return (
    <ImageBackground
      source={require('../img/logoVille.jpg')}
      style={{ width: '100%', height: '100%' }}>
      <View style={styles.textContainer}>
        <Text style={styles.textWelcome}>Méteo</Text>
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  textWelcome: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 30,
    paddingVertical:10,
    paddingHorizontal:20,
    color:'white',
    borderRadius: 30,
    backgroundColor:'rgba(107, 108, 108, 0.5)'
  },
});
