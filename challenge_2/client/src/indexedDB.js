import axios from 'axios';

export let db;

export const onloadFunc = () => {
  let request = window.indexedDB.open('bitcoinData_db', 1);
  request.onerror = () => {
    console.log('Database failed to open');
  };
  request.onsuccess = () => {
    console.log('Database opened successfully');
    db = request.result;
  };
  request.onupgradeneeded = (e) => {
    let db = e.target.result;
    let objectStore = db.createObjectStore('bitcoinData_os', { keyPath: 'request', autoIncrement: false });
    objectStore.createIndex('data', 'data', { unique: false });
    objectStore.createIndex('lastAccess', 'lastAccess', { unique: false });
    console.log('Database setup complete');
  };
}

export const onSubmit = (fromDate, toDate) => {
  const requestUrl = `https://api.coindesk.com/v1/bpi/historical/close.json?start=${fromDate}&end=${toDate}`;
  console.log(requestUrl);
  let transaction = db.transaction(['bitcoinData_os'], 'readwrite');
  let objectStore = transaction.objectStore('bitcoinData_os');
  let requestGet = objectStore.get(requestUrl);
  requestGet.onsuccess = (e) => {
    if (requestGet.result === undefined) {
      console.log('its not in the db', e);
      axios.get(requestUrl)
        .then((result) => {
          console.log('result:', result);
          let transaction = db.transaction(['bitcoinData_os'], 'readwrite');
          let objectStore = transaction.objectStore('bitcoinData_os');
          let requestAdd = objectStore.add({ request: requestUrl, data: result.data.bpi, lastAccess: `${new Date()}`});
          requestAdd.onsuccess = () => {
            console.log('successfully added the data into db')
          };
          requestAdd.onerror = (error) => {
            console.log('theres an error adding to db:', error);
          }
          const dataArray = Object.values(result.data.bpi);
          const keyArray = Object.keys(result.data.bpi);
          const days = dataArray.length;
          const chartElement = document.getElementById('mychart');
          const myChart = new Chart(chartElement, {
            type: 'line',
            data: {
              labels: keyArray,
              datasets: [{
                label: 'BPI',
                data: dataArray
              }]
            },
            options: {
              title: {
                display: true,
                text: `Closing BPI the last ${days} days`
              }
            }
          });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      let transaction = db.transaction(['bitcoinData_os'], 'readwrite');
      let objectStore = transaction.objectStore('bitcoinData_os');
      let requestPut = objectStore.put({ request: requestUrl, data: requestGet.result.data, lastAccess: `${new Date()}`});
      requestPut.onsuccess = () => console.log('successfully updated the new access date');
      const dataArray = Object.values(requestGet.result.data);
      const keyArray = Object.keys(requestGet.result.data);
      const days = dataArray.length;
      const chartElement = document.getElementById('mychart');
      const myChart = new Chart(chartElement, {
        type: 'line',
        data: {
          labels: keyArray,
          datasets: [{
            label: 'BPI',
            data: dataArray
          }]
        },
        options: {
          title: {
            display: true,
            text: `Closing BPI the last ${days} days`
          }
        }
      });
    }
  }
  requestGet.onerror = (e) => {
    console.log('theres an error in requestGet')
  }
}