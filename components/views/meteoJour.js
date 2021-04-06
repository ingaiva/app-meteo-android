import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as outils from '../../outils';

export default function MeteoJour() {
  const apiKey = 'your-key';
  const storageKey = '@bocal:tp_meteo_jour';
  const [meteo, setMeteo] = useState(outils.getEmptyMeteoDay()); 

  useEffect(() => {
    getMeteo();
  }, []);

  async function getMeteo() {       
    try {
      let meteoJson = await AsyncStorage.getItem(storageKey);
      if(!meteoJson){
        throw new Error("Aucune données enregistrée");
      }
      let storedMeteo = JSON.parse(meteoJson);
      
      let dateDiff = outils.calcDateDiff(storedMeteo.date);      
      if (dateDiff==null || dateDiff > 1) {        
        getMeteoApi();
      } else {
        setMeteo(storedMeteo);
      }
    } catch (err) {
      console.log(
        "Une erreur s'est produite lors de la recuperation de la méteo stocké : " +
          err
      );
      AsyncStorage.removeItem(storageKey);
      getMeteoApi();
    }
  }

  async function getMeteoApi() {
    
    let location = await outils.getLocation();
    if (!location) {
      let newMeteo = outils.getEmptyMeteoDay();
      newMeteo.desc = 'Impossible de recupérer la position actuelle : ';
      setMeteo(newMeteo);
      return;
    }

    let url = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=metric&lang=fr&lat=${location.coords.latitude}&lon=${location.coords.longitude}`;

    var myInit = { method: 'GET' };
    try {
      const responsePromise = await fetch(url, myInit);
      const responseData = await responsePromise.json();

      if (responseData instanceof Error) {
        console.log('Une erreur : ' + responseData);
        let newMeteo = outils.getEmptyMeteoDay();
        newMeteo.desc =
          "Une erreur s'est produite : " + JSON.stringify(responseData.message);
        setMeteo(newMeteo);
      } else {
        let newMeteo = outils.getMeteoDay(responseData);
        //console.log("new meteo : " + JSON.stringify(newMeteo));
        await AsyncStorage.setItem(storageKey, JSON.stringify(newMeteo));
        setMeteo(newMeteo);
      }
    } catch (error) {
      console.log('Une erreur : ' + error);
      let newMeteo = outils.getEmptyMeteoDay();
      newMeteo.desc = "Une erreur s'est produite";
      setMeteo(newMeteo);
    }
  }

  function renderImgMeteo() {
    if (meteo.img.length > 0) {
      return <Image style={styles.imageMeteo} source={{ uri: meteo.img }} />;
    }
  }
  function renderImgVille() {
    if (meteo && (meteo?.ville === 'Antibes' || meteo?.ville==='Juan-les-Pins')) {
      return (
        <Image style={styles.imageVille} source={require('../../img/ville.jpg')} />
      );
    }
    else {
       return (
        <Image style={styles.imageVille} source={require('../../img/logoVille.jpg')} />
      );
    }
  }
  //fonction de rendu principale :
  return (
    <View style={styles.container}>      
      {renderImgVille()}
      <Text style={styles.nomVille}>{meteo.ville}</Text>
      <Text style={styles.meteoDate}>{outils.getElementDateAsStr(meteo)}</Text>
      <TouchableOpacity style={styles.button} onPress={getMeteoApi}>
        <Text style={styles.buttonText}>Recharger</Text>
      </TouchableOpacity>
      <View style={styles.flexViewContainer}>
        <Text style={styles.meteoDesc}>{meteo.desc}</Text>
        <Text style={styles.meteoTemp}>{meteo.temp}</Text>
        <View style={styles.imageMeteoContainer}>{renderImgMeteo()}</View>
      </View>
      <Text>{meteo.vent}</Text>
      <Text>{meteo.humidite}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexViewContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  nomVille: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  meteoDesc: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
  meteoTemp: {
    fontWeight: 'bold',
    fontSize: 20,
    marginRight: 5,
  },
  imageVille: {
    maxHeight: 160,
    maxWidth: '100%',
  },
  imageMeteoContainer: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
  },
  imageMeteo: {
    width: 50,
    height: 50,
  },
  meteoDate: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    margin: 5,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: '#5d5f60',
    backgroundColor: '#5d5f60',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});
