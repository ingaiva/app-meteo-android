import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as outils from '../../outils';
const Tab = createBottomTabNavigator();

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
const iconJour = ({ color }) => (
  <FontAwesome5 name={'calendar-day'} size={20} color={color} />
);
const iconRefresh = <FontAwesome5 name={'sync'} size={15} color="white" />;

export default function Meteo5joursAdvanced() {
  const apiKey = '0d03db7469d9604cc4cf30772e55ad05';
  const storageKey = '@bocal:tp_meteo_5jours';
  const [meteo, setMeteo] = useState(outils.getEmptyMeteo());
  const [dayW, setDay] = useState('');
  const [tab, setTab] = useState([]);

  useEffect(() => {
    getMeteo();
  }, []);

  async function getMeteo() {
   
    try {
      let meteoJson = await AsyncStorage.getItem(storageKey);
      if (!meteoJson) {
       throw new Error("Aucune données enregistrée");
      }
      let storedMeteo = JSON.parse(meteoJson);

      let dateDiff = outils.calcDateDiff(storedMeteo.curDate);
      if (dateDiff == null || dateDiff > 1) {
        getMeteoApi();
      } else {
        setTab(arrangeTabByWDay(storedMeteo));
        setMeteo(storedMeteo);
      }
    } catch (err) {
      console.log(
        'Erreur lors de la recuperation de la méteo stockée sur appareil : ' +
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
        setTab(arrangeTabByWDay(newMeteoObj));
        setMeteo(newMeteoObj);
      }
    } catch (error) {
      console.log('Une erreur : ' + error);
      let newMeteo = outils.getEmptyMeteo();
      newMeteo.ville = "Une erreur s'est produite";
      setTab([]);
      setMeteo(newMeteo);
    }
  }

  function arrangeTabByWDay(meteo) {
    let tab = [];
    meteo.data.forEach((element) => {
      let dw = outils.getDayWeek(element.date);
      const found = tab.find((element) => element.dw == dw);
      if (found === undefined) {
        tab.push({
          dw: dw,
          day: outils.getDateShortAsStr(element.date),
          data: [element],
        });
      } else {
        found.data.push(element);
      }
    });
    if (tab.length > 0) {
      //console.log("setDay");
      setDay(tab[0].dw);
    }
    return tab;
  }

  function renderNav() {
    if (tab && tab?.length > 0) {
      try {
        let tabBtns = [];
        tab.forEach((element) => {
          tabBtns.push(
            <TouchableOpacity
              style={getDwColor(element)}
              onPress={() => setDay(element.dw)}>
              <Text style={styles.buttonText}>{element.dw}</Text>
            </TouchableOpacity>
          );
        });
        return tabBtns;
      } catch (er) {
        console.log(' renderNav : ' + er);
      }
    }
  }

  function getDwColor(curElement) {
    if (dayW && curElement.dw === dayW) {
      return [styles.buttonDay, { backgroundColor: 'tomato' }];
    } else {
      return styles.buttonDay;
    }
  }
  function renderMeteoByDay() {
    if (dayW) {
      let dataDw = tab.find((element) => element.dw == dayW);
      if (dataDw != undefined) {
        let tagBloc = [];
        dataDw.data.forEach((element) => {
          tagBloc.push(
            <View style={styles.meteoDayContainer}>
              <Text style={styles.meteoDate}>
                {outils.getTimeShortAsStr(element.date)}
              </Text>
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
  }

  function getDayText() {
    if (dayW) {
      let dataDw = tab.find((element) => element.dw == dayW);
      if (dataDw != undefined) {
        return dataDw.day;
      }
    }
  }

  function renderImgMeteo(element) {
    if (element?.img.length > 0) {
      return <Image style={styles.imageMeteo} source={{ uri: element.img }} />;
    }
  }

  function renderImgVille() {
    if (
      meteo &&
      (meteo?.ville === 'Antibes' || meteo?.ville === 'Juan-les-Pins')
    ) {
      return (
        <Image style={styles.imageVille} source={require('../../img/ville.jpg')} />
      );
    } else {
      return (
        <Image
          style={styles.imageVille}
          source={require('../../img/logoVille.jpg')}
        />
      );
    }
  }

  //Fonction de rendu principale:
  return (
    <View style={styles.container}>
      {renderImgVille()}
      <View style={styles.daysContainer}>
        {renderNav()}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 3, alignItems:'center' }}>
        <Text style={styles.nomVille}>{meteo.ville}</Text>
        <TouchableOpacity style={styles.button} onPress={getMeteoApi}>
          {iconRefresh}
        </TouchableOpacity>
        <Text style={{fontSize:10, color:'white', marginLeft:5}}>{outils.getDateAsStr(meteo.curDate)}</Text>
      </View>
      <Text style={styles.callApiDate}>{getDayText()}</Text>
      <ScrollView style={{ width: '100%' }}>{renderMeteoByDay()}</ScrollView>
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
  daysContainer: {
    backgroundColor: '#5d5f60',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 2,    
  },
  meteoDayContainer: {
    marginVertical: 1,
    marginHorizontal: 2,
    padding: 5,
    backgroundColor: 'snow',
    borderRadius: 10,
  },
  callApiDate: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 3,
  },
  meteoViewCenter: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  nomVille: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
    marginVertical: 1,
    marginHorizontal: 8,
  },
  meteoDate: {
    fontWeight: 'normal',
    fontSize: 14,
    textAlign: 'center',
  },
  meteoDesc: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  meteoTemp: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  imageVille: {
    maxHeight: 100,
    maxWidth: '100%',
  },
  imageMeteoContainer: {
    backgroundColor: 'lightgray',
    borderRadius: 10,
  },
  imageMeteo: {
    width: 30,
    height: 30,
  },
  buttonDay: {
    marginVertical: 3,
    marginRight: 1,
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderRadius: 3,
    borderColor: '#5d5f60',
    backgroundColor: '#5d5f60',
  },
  button: {
    marginVertical: 1,
    paddingVertical: 3,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#5d5f60',
    backgroundColor: '#5d5f60',
    color: 'white',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});
