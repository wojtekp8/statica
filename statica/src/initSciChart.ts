import {
    SciChartSurface,
    NumericAxis,
    FastLineRenderableSeries,
    XyDataSeries,
    EAxisAlignment,
    NumberRange,
    SciChartJsNavyTheme,
    DateTimeNumericAxis
} from "scichart";
import axios from 'axios';

async function fetchData() {
    const url = 'https://rest.statica.pl/rest/stockquotes/gpw:PLKGHM000017?type=trades&dt_from=2010-01-01&limit=10000';
    const auth = {
      username: 'frontend2024',
      password: 'test'
    };
  
    try {
      const response = await axios.get(url, { auth });
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
}

interface DataItem {
    dt: number;
    price: number;
    amount: number;
}

export async function initSciChart() {
    await SciChartSurface.useWasmFromCDN();

    const { sciChartSurface, wasmContext } = await SciChartSurface.create("scichart-root", {
        theme: new SciChartJsNavyTheme(),
        title: "SciChart.js Dual Axis Chart",
        titleStyle: { fontSize: 22 }
    });

    const data = await fetchData();

    if (data && data.length > 0) {
        const xValues = data.map((item: DataItem) => item.dt / 1000);
        const yValuesPrice = data.map((item: DataItem) => item.price);
        const yValuesAmount = data.map((item: DataItem) => item.amount);
        const maxPrice = Math.max(...yValuesPrice);
        const maxAmount = Math.max(...yValuesAmount);
        const scaleFactor = maxPrice / (2 * maxAmount);
        const yValuesAmountScaled = yValuesAmount.map((value: number) => value * scaleFactor);

        const xAxis = new DateTimeNumericAxis(wasmContext, {
            visibleRange: new NumberRange(Math.min(...xValues), Math.max(...xValues)),
        });

        const yAxis = new NumericAxis(wasmContext, {
            axisAlignment: EAxisAlignment.Right,
            growBy: new NumberRange(0.1, 0.1)
        });

        sciChartSurface.xAxes.add(xAxis);
        sciChartSurface.yAxes.add(yAxis);

        const dataSeriesPrice = new XyDataSeries(wasmContext, { xValues, yValues: yValuesPrice });
        const dataSeriesAmount = new XyDataSeries(wasmContext, { xValues, yValues: yValuesAmountScaled });

        const lineSeriesPrice = new FastLineRenderableSeries(wasmContext, {
            dataSeries: dataSeriesPrice,
            stroke: "red",
            strokeThickness: 3
        });
        
        const lineSeriesAmount = new FastLineRenderableSeries(wasmContext, {
            dataSeries: dataSeriesAmount,
            stroke: "blue",
            strokeThickness: 3
        });
        

        sciChartSurface.renderableSeries.add(lineSeriesPrice);
        sciChartSurface.renderableSeries.add(lineSeriesAmount);
    }

    return sciChartSurface;
}
