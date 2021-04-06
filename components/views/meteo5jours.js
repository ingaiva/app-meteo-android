import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  TouchableOpacity,ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as outils from '../../outils';

export default function Meteo5jours() {
  const apiKey = '0d03db7469d9604cc4cf30772e55ad05';
  const storageKey = '@bocal:tp_meteo_5jours'; 
  const [meteo, setMeteo] = useState(outils.getEmptyMeteo()); 

  useEffect(() => {
    getMeteo();
  }, []);
 

  async function getMeteo() {    
    try {
      let meteoJson = await AsyncStorage.getItem(storageKey);
      if (!meteoJson) {
        getMeteoApi();
        return;
      }
      let storedMeteo = JSON.parse(meteoJson);
      let dateDiff = outils.calcDateDiff(storedMeteo.curDate);
     
      if (dateDiff==null || dateDiff > 1) {
        getMeteoApi();
      } else {
        setMeteo(storedMeteo);
      }
    } catch (err) {
      console.log(
        'Une erreur lors de la recuperation de la méteo stockée sur appareil : ' +
        err
      );
      AsyncStorage.removeItem(storageKey);
      getMeteoApi();
    }
  }

  async function getMeteoApi() {
    let location = await outils.getLocation();
    let url = `https://api.openweathermap.org/data/2.5/forecast?appid=${apiKey}&units=metric&lang=fr&lat=${location.coords.latitude}&lon=${location.coords.longitude}`;

    var myInit = { method: 'GET' };
    try {
      const responsePromise = await fetch(url, myInit);
      const responseData = await responsePromise.json();

      if (responseData instanceof Error) {
        console.log('Une erreur : ' + responseData);
        let newMeteo = outils.getEmptyMeteo();
        newMeteo.ville =
          "Une erreur s'est produite : " + JSON.stringify(responseData.message);
        setMeteo(newMeteo);
      } else {
        const lst = responseData?.list;

        let newMeteoObj = outils.getEmptyMeteo();
        newMeteoObj.ville = responseData?.city?.name;
        newMeteoObj.curDate = new Date().getTime();
        let newMeteoArr = [];
        if (lst) {
          lst.forEach((element) => {
            newMeteoArr.push(outils.getMeteoDay(element));
          });
        }
        newMeteoObj.data = newMeteoArr;
        await AsyncStorage.setItem(storageKey, JSON.stringify(newMeteoObj));
        setMeteo(newMeteoObj);
      }
    } catch (error) {
      console.log('Une erreur : ' + error);
      let newMeteo = outils.getEmptyMeteo();
      newMeteo.ville = "Une erreur s'est produite";
      setMeteo(newMeteo);
    }
  }
 

  function renderImgMeteo(element) {
    if (element?.img.length > 0) {
      return <Image style={styles.imageMeteo} source={{ uri: element.img }} />;
    }
  }

  function renderMeteoByDay() {
    if (meteo?.data?.length > 0) {
      let tagBloc = [];
      meteo.data.forEach((element) => {
        tagBloc.push(
          <View style={styles.meteoDayContainer}>
            <Text style={styles.meteoDate}>{outils.getElementDateAsStr(element)}</Text>
            <View style={styles.meteoViewCenter}>
              <Text style={styles.meteoDesc}>{element.desc}</Text>
              <Text style={styles.meteoTemp}>{element.temp}</Text>
              <View style={styles.imageMeteoContainer}>
                {renderImgMeteo(element)}
              </View>
            </View>
            <Text>{element.vent}</Text>
            <Text>{element.humidite}</Text>
          </View>
        );
      });
      return tagBloc;
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

  //Fonction de rendu principale:
  return (
    <View style={styles.container}>
      {renderImgVille()}
      <Text style={styles.nomVille}>{meteo.ville}</Text>
      <Text style={styles.callApiDate}> {outils.getDateAsStr(meteo?.curDate)}</Text>
      <TouchableOpacity style={styles.button} onPress={getMeteoApi}>
        <Text style={styles.buttonText}>Recharger</Text>
      </TouchableOpacity>
      <ScrollView horizontal={true} style={{width:'100%'}}>
        {renderMeteoByDay()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meteoDayContainer: {
    textAlign:'center',
    marginVertical: 5,
    marginHorizontal:10,
    padding: 5,
    backgroundColor: 'snow',
    borderRadius:10
  },
  callApiDate: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 5,
  },
  meteoViewCenter: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  nomVille: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
    marginVertical: 5,
  },
  meteoDate: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  meteoDesc: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 5,
  },
  meteoTemp: {
    fontWeight: 'bold',
    fontSize: 20,
    marginRight: 8,
  },
  imageVille: {
    maxHeight: 100,
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
