import * as Location from 'expo-location';

export async function getLocation() {
  let { status } = await Location.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Permission to access location was denied');
    return;
  }
  let location = await Location.getCurrentPositionAsync({});
  return location;
}

export function getElementDateAsStr(element) {
  if (element?.date) {
    return getDateAsStr(element.date);
  }
  return '';
}
export function getTimeShortAsStr(dt) {
  if (dt) {
    try {
      let d = new Date(dt);
      let hh = d.getHours();
      let minutes = d.getMinutes();
      if (hh < 10) hh = '0' + hh;
      if (minutes < 10) minutes = '0' + minutes;
      var retVal = hh + ':' + minutes;
      return retVal;
    } catch (e) {
      console.log('getTimeShortAsStr : ' + e);
    }
  }
  return '';
}
export function getDateShortAsStr(dt) {
  if (dt) {
    try {
      let weekdays = new Array();
      weekdays[0] = 'dimanche';
      weekdays[1] = 'lundi';
      weekdays[2] = 'mardi';
      weekdays[3] = 'mercredi';
      weekdays[4] = 'jeudi';
      weekdays[5] = 'vendredi';
      weekdays[6] = 'samedi';

      let d = new Date(dt);
      let jour = d.getDate();
      let mois = d.getMonth();
      let annee = d.getFullYear();
      let ww = d.getDay();
      let hh = d.getHours();
      let minutes = d.getMinutes();

      mois++;
      if (jour < 10) jour = '0' + jour;
      if (mois < 10) mois = '0' + mois;

      var retVal = weekdays[ww] + ' ' + jour + '/' + mois + '/' + annee;
      return retVal;
    } catch (e) {
      console.log('getDateShortAsStr : ' + e);
    }
  }
  return '';
}

export function getDayWeek(dt) {
  let d = new Date(dt);
  let weekdays = new Array();
  weekdays[0] = 'dimanche';
  weekdays[1] = 'lundi';
  weekdays[2] = 'mardi';
  weekdays[3] = 'mercredi';
  weekdays[4] = 'jeudi';
  weekdays[5] = 'vendredi';
  weekdays[6] = 'samedi';
  let ww = d.getDay();
  return weekdays[ww];
}

export function getDateAsStr(dt) {
  if (dt) {
    try {
      let weekdays = new Array();
      weekdays[0] = 'dimanche';
      weekdays[1] = 'lundi';
      weekdays[2] = 'mardi';
      weekdays[3] = 'mercredi';
      weekdays[4] = 'jeudi';
      weekdays[5] = 'vendredi';
      weekdays[6] = 'samedi';

      let d = new Date(dt);
      let jour = d.getDate();
      let mois = d.getMonth();
      let annee = d.getFullYear();
      let ww = d.getDay();
      let hh = d.getHours();
      let minutes = d.getMinutes();

      mois++;
      if (jour < 10) jour = '0' + jour;
      if (mois < 10) mois = '0' + mois;
      if (hh < 10) hh = '0' + hh;
      if (minutes < 10) minutes = '0' + minutes;

      var retVal =
        weekdays[ww] +
        ' ' +
        jour +
        '/' +
        mois +
        '/' +
        annee +
        ' ' +
        hh +
        ':' +
        minutes;
      return retVal;
    } catch (e) {
      console.log('renderDateAsStr : ' + e);
    }
  }
  return '';
}

export function getMeteoDay(element) {
  let desc = '';
  let imgCode = '';
  let temp = '';
  let humidite = '';
  let vent = '';
  let dateMeteo = '';
  if (element?.weather?.length > 0) {
    desc = element.weather[0].description;
    imgCode = element.weather[0].icon;
  }
  temp = element?.main?.temp;
  humidite = element?.main?.humidity;
  vent = (parseInt(element?.wind?.speed * 3.6));
  dateMeteo = element?.dt * 1000;
  const imgUri = `http://openweathermap.org/img/wn/${imgCode}@2x.png`;

  return {
    ville: element?.name,
    img: imgUri,
    desc: desc,
    temp: Number.parseInt(temp) + '°C',
    vent: 'Vent : ' + vent + ' km/h',
    humidite: 'Humidité : ' + humidite + '%',
    date: dateMeteo,
  };
}

export function getEmptyMeteo() {
  return {
    ville: '',
    curDate: '',
    data: [],
  };
}

export function getEmptyMeteoDay() {
  return {
    img: '',
    desc: '',
    temp: '',
    vent: '',
    humidite: '',
    date: '',
  };
}
export function calcDateDiff(dt) {
  try {  
    
    return parseInt((new Date() - new Date(dt)) / (60 * 60 * 1000));
  } catch (er) {
    return null;
  }
}
