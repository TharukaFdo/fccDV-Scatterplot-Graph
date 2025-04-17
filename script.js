const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

fetch(url)
  .then(res => res.json())
  .then(data => drawChart(data));

function drawChart(data) {
  const svg = d3.select('#scatterplot');
  const width = +svg.attr('width');
  const height = +svg.attr('height');
  const padding = 60;

  const parseTime = d3.timeParse('%M:%S');
  data.forEach(d => {
    d.Time = parseTime(d.Time);
  });

  const xScale = d3.scaleLinear()
    .domain([d3.min(data, d => d.Year) - 1, d3.max(data, d => d.Year) + 1])
    .range([padding, width - padding]);

  const yScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.Time))
    .range([padding, height - padding]);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));

  svg.append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${height - padding})`)
    .call(xAxis);

  svg.append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${padding}, 0)`)
    .call(yAxis);

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 0)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Time in Minutes");

  const tooltip = d3.select('#tooltip');

  svg.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => xScale(d.Year))
    .attr('cy', d => yScale(d.Time))
    .attr('r', 6)
    .attr('data-xvalue', d => d.Year)
    .attr('data-yvalue', d => d.Time.toISOString())
    .attr('fill', d => d.Doping ? 'red' : 'green')
    .on('mouseover', (event, d) => {
      tooltip
        .style('opacity', 0.9)
        .html(`
          <strong>${d.Name}</strong> (${d.Nationality})<br/>
          Year: ${d.Year}, Time: ${d3.timeFormat('%M:%S')(d.Time)}<br/>
          ${d.Doping ? d.Doping : 'No doping allegations'}
        `)
        .attr('data-year', d.Year)
        .style('left', event.pageX + 10 + 'px')
        .style('top', event.pageY - 40 + 'px');
    })
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });

  const legend = d3.select('#legend');

  legend.html(`
    <div><span style="color: green; font-weight: bold;">&#9632;</span> No Doping Allegations</div>
    <div><span style="color: red; font-weight: bold;">&#9632;</span> Riders with Doping Allegations</div>
  `);
}
