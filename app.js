const width = 800;
    const height = 400;
    let barWidth;

document.addEventListener('DOMContentLoaded', function() {
    fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
        .then(res => res.json())
        .then(data => { 
            // document.getElementById('chart').innerHTML = content;
            let entryCount = data.data.reduce((sum, cur) => sum + 1, 0);
            barWidth = width / entryCount;
            createVisualization(data.data);
        });
});

function createVisualization(data) {
    let svg = d3.select('#chart')
              .append('svg')
              .attr('width', width + 80)
              .attr('height', height + 30);
    svg.append('text')
       .attr('x', -240)
       .attr('y', 80)
       .attr('transform', 'rotate(-90)')
       .text('GDP (Billions)');
    let tooltip = d3.select('#chart')
                    .append('div')
                    .attr('id', 'tooltip')
                    .style('opacity', '0%');
    let fillEffect = d3.select('#chart')
                       .append('div')
                       .attr('class', 'white')
                       .style('opacity', '0%');

    let dateQuarters = data.map(item => {
        let quarter = item[0].substring(5,7);
        let newQuarter;
        if (quarter === "01") {
            newQuarter = "Q1";
        } else if (quarter === "04") {
            newQuarter = "Q2";
        } else if (quarter === "07") {
            newQuarter = "Q3";
        } else if (quarter === "10") {
            newQuarter = "Q4";
        }
        return [item[0].substring(0,4) + " " + newQuarter, item[1]];
    });

    const years = data.map(item => parseInt(item[0].substring(0,4)));
    const dates = data.map(item => new Date(item[0]));

    let xMax = new Date(d3.max(dates));
    xMax.setMonth(xMax.getMonth() + 3);
    const xScale = d3.scaleTime().domain([d3.min(dates), xMax]).range([0, width]);
    const xAxis = d3.axisBottom().scale(xScale);
    svg.append('g')
       .call(xAxis)
       .attr('id', 'x-axis')
       .attr('transform', 'translate(50, 400)');

    const gdp = data.map(item => item[1]);

    const heightScale = d3.scaleLinear().domain([0, d3.max(gdp)]).range([0, height]);
    const gdp_scaled = gdp.map(item => heightScale(item));

    const yScale = d3.scaleLinear().domain([0, d3.max(gdp)]).range([height, 0]);
    const yAxis = d3.axisLeft(yScale);
    svg.append('g')
       .call(yAxis)
       .attr('id', 'y-axis')
       .attr('transform', 'translate(50, 0)');

    d3.select('svg')
      .selectAll('rect')
      .data(gdp_scaled)
      .enter()
      .append('rect')
      .attr('x', (d, i) => xScale(dates[i]))
      .attr('y', (d, i) => height - d)
      .attr('width', barWidth)
      .attr('height', d => d)
      .attr('fill', '#77E9EB')
      .attr('transform', 'translate(50,0)')
      .attr('data-date', (d, i) => data[i][0])
      .attr('data-gdp', (d, i) => data[i][1])
      .attr('class', 'bar')
      .on('mouseover', function(d, i) {
        fillEffect.transition().duration(0).style('opacity', 0.95);  
        fillEffect
            .style('height', d + 'px')
            .style('width', barWidth + 'px')
            .style('left', i * barWidth + 0 + 'px')
            .style('top', height - d + 'px')
            .style('transform', 'translateX(50px)');
        tooltip.transition().duration(100).style('opacity', 0.95);
        tooltip
            .style('left', i * barWidth + 70 + 'px')
            .style('top', height - 150 + 'px')
            .attr('data-date', data[i][0])
            .html(dateQuarters[i][0] + '<br>' + '$' + gdp[i].toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' Billion');
      })
      .on('mouseout', function() {
          tooltip.transition().duration(100).style('opacity', 0);
          fillEffect.transition().duration(100).style('opacity', 0);
      })
}
