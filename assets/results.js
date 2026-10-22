/* Values transcribed from the supplied camera-ready manuscript, Tables 2–3.
   Columns: model, accuracy (%), F1 (%), AUROC (%), estimated energy (mJ).
   Energy is the paper's 45 nm CMOS analytical estimate, not a hardware measurement. */
'use strict';
const benchmarks = {
  ptb: { name: 'PTB', task: '2-class ECG classification', protocol: 'subject-independent protocol', table: 2, highlight: 'SpikeMamba-L', rows: [
    ['iTransformer',83.89,79.06,91.18,51.51],['MTST',76.59,67.38,86.86,8803.84],['Reformer',77.96,69.65,91.13,3866.06],['Medformer',83.50,79.18,92.81,7564.93],['SpikeMamba-L',91.72,94.00,94.92,322.91],['SpikeMamba-M',89.00,92.27,92.73,46.78],['SpikeMamba-T',80.34,86.72,84.35,4.69]
  ]},
  ptbxl: { name: 'PTB-XL', task: '5-class ECG classification', protocol: 'subject-independent protocol', table: 2, highlight: 'SpikeMamba-M', rows: [
    ['iTransformer',69.28,56.20,86.71,51.53],['MTST',72.14,61.43,88.97,8807.42],['Reformer',71.72,60.69,88.80,3867.83],['Medformer',72.87,62.02,89.66,8225.97],['SpikeMamba-L',74.16,60.91,90.19,260.41],['SpikeMamba-M',74.13,62.50,90.30,37.09],['SpikeMamba-T',72.93,61.27,89.26,3.97]
  ]},
  adftd: { name: 'ADFTD', task: '3-class EEG classification', protocol: 'subject-independent protocol', table: 2, highlight: 'SpikeMamba-L', rows: [
    ['iTransformer',52.60,46.79,67.26,104.32],['MTST',45.60,43.31,62.50,22551.78],['Reformer',50.78,47.94,69.17,4974.18],['Medformer',53.27,50.65,70.93,11589.69],['SpikeMamba-L',53.62,46.58,70.04,262.53],['SpikeMamba-M',52.02,40.01,66.73,41.74],['SpikeMamba-T',52.28,38.16,62.44,4.08]
  ]},
  chbmit: { name: 'CHB-MIT', task: '2-class EEG seizure prediction', protocol: 'segment-level random 6:2:2 split', table: 3, highlight: 'SpikeMamba-M', rows: [
    ['Medformer',83.79,78.35,88.96,3914.08],['SpikeMamba-L',80.48,72.01,91.59,320.07],['SpikeMamba-M',88.57,80.02,94.48,56.86],['SpikeMamba-T',84.49,73.61,91.35,6.63]
  ]},
  mitbih: { name: 'MIT-BIH', task: '5-class ECG arrhythmia classification', protocol: 'segment-level random 6:2:2 split', table: 3, highlight: 'SpikeMamba-M', rows: [
    ['Medformer',98.99,95.28,99.76,2147.43],['SpikeMamba-L',97.05,86.37,99.44,366.54],['SpikeMamba-M',98.87,94.81,99.79,48.19],['SpikeMamba-T',86.84,64.86,95.94,4.23]
  ]}
};
let selectedDataset = 'ptb';
let selectedModel = benchmarks.ptb.highlight;
const chartTheme = getComputedStyle(document.documentElement);
const chartColor = (property, fallback) => chartTheme.getPropertyValue(property).trim() || fallback;
const colors = {
  'SpikeMamba-L': chartColor('--chart-spike-l', '#24493b'),
  'SpikeMamba-M': chartColor('--chart-spike-m', '#4b7455'),
  'SpikeMamba-T': chartColor('--chart-spike-t', '#7b8d46')
};
const chartPalette = {
  baseline: chartColor('--chart-baseline', '#a7664b'),
  axis: chartColor('--chart-axis', '#647069'),
  grid: chartColor('--chart-grid', '#dce1d5'),
  background: chartColor('--chart-background', '#f8f7f3')
};
const chart = document.getElementById('results-chart');
const resultTable = document.getElementById('results-table');

function updateInsight() {
  const dataset = benchmarks[selectedDataset];
  const row = dataset.rows.find(item => item[0] === selectedModel);
  const baseline = dataset.rows.find(item => item[0] === 'Medformer');
  document.getElementById('insight-label').textContent = `${dataset.name} · ${row[0]}`;
  document.getElementById('insight-accuracy').innerHTML = `${row[1].toFixed(2)}<span>%</span>`;
  document.getElementById('insight-f1').textContent = `${row[2].toFixed(2)}%`;
  document.getElementById('insight-energy').textContent = row[4].toFixed(2);
  const delta = row[1] - baseline[1];
  const ratio = baseline[4] / row[4];
  document.getElementById('insight-comparison').textContent = row[0] === 'Medformer'
    ? 'Medformer is the reference baseline for the energy and accuracy comparisons shown here.'
    : `${(ratio >= 1 ? ratio : 1 / ratio).toFixed(1)}× ${ratio >= 1 ? 'lower' : 'higher'} estimated energy than Medformer, with ${delta >= 0 ? '+' : '−'}${Math.abs(delta).toFixed(2)} percentage points in accuracy.`;
  document.querySelectorAll('[data-model]').forEach(button => {
    const active = button.dataset.model === selectedModel;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  resultTable.querySelectorAll('tbody tr').forEach(tr => tr.classList.toggle('selected-row', tr.dataset.modelRow === selectedModel));
}

function drawChart() {
  const dataset = benchmarks[selectedDataset];
  const width=640, height=390, left=55, right=57, top=38, bottom=57;
  const plotW=width-left-right, plotH=height-top-bottom;
  const minY=Math.max(0, Math.floor((Math.min(...dataset.rows.map(row=>row[1]))-3)/5)*5);
  const maxY=Math.min(100,Math.ceil((Math.max(...dataset.rows.map(row=>row[1]))+3)/5)*5);
  const logMin=0, logMax=5;
  const x=value=>left+(Math.log10(value)-logMin)/(logMax-logMin)*plotW;
  const y=value=>top+(maxY-value)/(maxY-minY)*plotH;
  let content=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" aria-hidden="true"><g font-family="inherit" font-size="10" fill="${chartPalette.axis}">`;
  for(let i=0;i<=5;i++) {
    const value=minY+(maxY-minY)*i/5, yy=y(value);
    content+=`<path d="M${left} ${yy}H${width-right}" stroke="${chartPalette.grid}" stroke-dasharray="3 5"/><text x="${left-12}" y="${yy+3}" text-anchor="end">${Number(value.toFixed(1))}</text>`;
  }
  for(let power=logMin;power<=logMax;power++) {
    const value=10**power, xx=x(value);
    content+=`<path d="M${xx} ${top}V${height-bottom}" stroke="${chartPalette.grid}" opacity=".65"/><text x="${xx}" y="${height-bottom+23}" text-anchor="middle">${value>=1000?`${value/1000}k`:value}</text>`;
  }
  content+=`<text x="${left}" y="16" fill="${chartPalette.axis}">Accuracy (%)</text><text x="${width-right}" y="${height-7}" text-anchor="end" fill="${chartPalette.axis}">Estimated energy (mJ) · log scale</text></g>`;
  dataset.rows.forEach((row,index)=>{
    const selected=row[0]===selectedModel, xx=x(row[4]), yy=y(row[1]), spike=row[0].startsWith('SpikeMamba');
    const color=colors[row[0]]||chartPalette.baseline;
    const label=spike?row[0].replace('SpikeMamba-',''):row[0];
    // Manually chosen label offsets keep close PTB-XL and MIT-BIH points readable.
    let dx=0,dy=-15,anchor='middle';
    if(row[0]==='Medformer'){dx=10;dy=-11;anchor='start';}
    if(row[0]==='MTST'){dx=10;dy=17;anchor='start';}
    if(row[0]==='Reformer'){dy=20;}
    if(row[0]==='iTransformer'){dy=21;}
    if(selectedDataset==='ptb' && row[0]==='MTST'){dx=0;dy=20;anchor='middle';}
    if(selectedDataset==='adftd' && row[0]==='Medformer'){dx=-10;dy=-10;anchor='end';}
    content+=`<g><title>${row[0]}: ${row[1].toFixed(2)}% accuracy, ${row[4].toFixed(2)} mJ</title>${selected?`<circle cx="${xx}" cy="${yy}" r="13" fill="none" stroke="${color}" opacity=".25" stroke-width="7"/>`:''}<circle cx="${xx}" cy="${yy}" r="${spike?7:5}" fill="${color}" stroke="${chartPalette.background}" stroke-width="2"/><text x="${xx+dx}" y="${yy+dy}" text-anchor="${anchor}" font-family="inherit" font-size="${spike?12:9}" font-weight="${spike?600:400}" fill="${color}">${label}</text></g>`;
  });
  chart.innerHTML=content+'</svg>';
  chart.setAttribute('aria-label', `${dataset.name}: accuracy versus estimated energy on a logarithmic energy axis. SpikeMamba L, M, and T are labeled by model size. Selected: ${selectedModel}. Use the model buttons to inspect results or open the exact-values table.`);
}

function setDataset(key) {
  selectedDataset=key;
  const dataset=benchmarks[key];
  selectedModel=dataset.highlight;
  document.querySelectorAll('[data-dataset]').forEach(button=>{
    const active=button.dataset.dataset===key;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  document.getElementById('protocol-note').innerHTML=`<strong>Evaluation:</strong> ${dataset.name} · ${dataset.task} · ${dataset.protocol}.`;
  document.getElementById('results-caption').textContent=`${dataset.name} results · Paper, Table ${dataset.table}`;
  resultTable.querySelector('tbody').innerHTML=dataset.rows.map(row=>`<tr data-model-row="${row[0]}" class="${row[0].startsWith('SpikeMamba')?'spike-row':''}"><th scope="row">${row[0]}</th>${row.slice(1).map(value=>`<td>${value.toFixed(2)}</td>`).join('')}</tr>`).join('');
  document.getElementById('model-selector').innerHTML=[...dataset.rows].sort((a,b)=>Number(b[0].startsWith('SpikeMamba'))-Number(a[0].startsWith('SpikeMamba'))).map(row=>`<button data-model="${row[0]}" aria-pressed="false">${row[0]}</button>`).join('');
  document.querySelectorAll('[data-model]').forEach(button=>button.addEventListener('click',()=>{
    selectedModel=button.dataset.model;
    updateInsight();drawChart();
  }));
  updateInsight();drawChart();
}
document.querySelectorAll('[data-dataset]').forEach(button=>button.addEventListener('click',()=>setDataset(button.dataset.dataset)));
document.querySelector('.results-details').open=false;
setDataset('ptb');
