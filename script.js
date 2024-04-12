const w = 900,
      h = 500,
      padding = 40;

const svg = d3
  .select(".chart-container")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

const tooltip = d3
  .select(".chart-container")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json')
  .then(res => res.json())
  .then(data => {
    const dataset = data.data;

    const barW = (w - padding * 2) / dataset.length

    const yearsDate = dataset.map(item => new Date(item[0]));
    const xMax = new Date(d3.max(yearsDate));
    xMax.setMonth(xMax.getMonth() + 3);

    const years = dataset.map(item => {
      let quarter;
      const temp = item[0].substring(5, 7);
      const year = item[0].substring(0, 4);

      switch (temp) {
        case '01':
          return `${year} Q1`;

        case '04':
          return `${year} Q2`;

        case '07':
          return `${year} Q3`;

        case '10':
          return `${year} Q4`;
      }
    })

    console.log(years);

    const xScale = d3
      .scaleTime()
      .domain([d3.min(yearsDate), xMax])
      .range([padding, w - padding]);


    const GDP = dataset.map(item => item[1]);
    const gdpMax = d3.max(GDP);

    console.log(gdpMax);

    const linearScale = d3
      .scaleLinear()
      .domain([0, gdpMax])
      .range([padding, h - padding]);

    const scaledGDP = GDP.map(item => linearScale(item));

    const yScale = d3
      .scaleLinear()
      .domain([0, gdpMax])
      .range([h - padding, padding]);

    svg.selectAll("rect")
        .data(scaledGDP)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("data-date", (d, i) => dataset[i][0])
        .attr("data-gdp", (d, i) => dataset[i][1])
        .attr("x", (d, i) => xScale(yearsDate[i]))
        .attr("y", d => h - d)
        .attr("height", d => d - padding)
        .attr("width", barW)
        .attr("index", (d, i) => i)
        .style("fill", '#33edef')
        .on('mouseover', (event, d) => {
          const i = event.target.getAttribute('index');

          tooltip.transition().duration(100).style("opacity", 0.9);
          tooltip
            .html(
              years[i] +
                "<br>" +
                "$" +
                GDP[i].toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') +
                ' Billion'
            )
            .attr("data-date", dataset[i][0]);
        })
        .on('mouseout', () => {
          tooltip.transition().duration(100).style('opacity', 0);
        });

    svg.append("text")
        .attr("x", w / 2)
        .attr("y", h + 50)
        .text('More Information: http://www.bea.gov/national/pdf/nipaguid.pdf')
        .attr("class", "info");

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0, ${h - padding})`)
        .attr("id", "x-axis")
        .call(xAxis);

    svg.append("g")
        .call(yAxis)
        .attr("id", "y-axis")
        .attr("transform", `translate(${padding}, 0)`);
  })
  .catch(err => {
    console.error("There was a problem fetching the dataset: ", err);
  });