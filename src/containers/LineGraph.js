import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';

class LineGraph extends Component {

  state = {
    graphData: {
      cases: {},
      deaths: {},
      recovered: {}
    },
  }

  buildChartData = (data, name) => { 
    const dataByName = data[name]; 
    const dates = Object.keys(dataByName);
    const newCases = [];
    let newCase;
    let lastDay = '';
    dates.forEach(date => {
        if (lastDay === '') newCase = 0;
        else if (date !== lastDay) {
          newCase = dataByName[date] - dataByName[lastDay]
        }
        lastDay = date;
        newCases.push(newCase);
    });
    return [newCases, dates];
  }

  componentDidMount() {
    fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=30")
    .then(res => res.json())
    .then(data => {
      this.setState({
        graphData: data
      });
    }).catch(e => {
      console.log(e)
    });
  }

  render () {
    const dataChart = this.buildChartData(this.state.graphData, this.props.casesType);
    const dates = dataChart[1].map(date => moment(new Date(date)).format('YYYY-MM-DD'))
    const cases = dataChart[0];
    const finalData = {
      labels: dates,
      datasets: [
        {
          label: this.props.typeChart.label,
          fill: false,
          lineTension: 0.1,
          backgroundColor: this.props.typeChart.color,
          borderColor: this.props.typeChart.color,
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: this.props.typeChart.color,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: this.props.typeChart.color,
          pointHoverBorderColor: this.props.typeChart.color,
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: cases
        }
      ],
    }
    const config = {
      scales: {
        xAxes: [{
          unit: 'day',
          type: 'time', 
          displayFormat: {
            'day': "MMM DD",
          }
        }],
        yAxes: [{
          ticks: {
            callback: function(value, index, values) {
                return value/1000 + "K";
            }
          }
        }]
    },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            return tooltipItem.yLabel/1000 + ' K';
          }
        }
      }
    }
    const style = {
      "marginTop": "20px",
    }
    return (
      <div style={style}>
        <Line data={finalData} options={config} />
      </div>
    )
  }
  
}

export default LineGraph;

