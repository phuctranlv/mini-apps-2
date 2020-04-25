import React, { Component, useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'chart.js';
import { db, onloadFunc, onSubmit } from './indexedDB.js';

const App = () => {
  const [firstRender, setFirstRender] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    onloadFunc();
    axios.get('https://api.coindesk.com/v1/bpi/historical/close.json')
      .then((result) => {
        setFirstRender(false);
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
  }, [firstRender]);

  const onSubmitHandler = (e) => {
    e.preventDefault();
    onSubmit(fromDate, toDate);
  }

  return (
    <div>
      <div>hello back</div>
      <form name="requestForm" onSubmit={onSubmitHandler}>
        <div>Select a range of date you'd like to see the closing BPI</div>
        <label>From:</label>
        <input type="date" name="fromDate" onChange={(e) => setFromDate(e.target.value)}></input>
        <label>To:</label>
        <input type="date" name="toDate" onChange={(e) => setToDate(e.target.value)}></input>
        <input type="submit"></input>
      </form>
      <canvas id="mychart"></canvas>
    </div>
  );
};

export default App;
