<script lang="ts">
  // dependencies
  export let data:string[];

  // constants
  const COLORS = [
    "#5f9ea0",
    "#a33a3a",
    "yellow",
    "green",
    "cornflowerblue",
    "blue",
    "purple"
  ]

  import { onMount } from 'svelte';
	import * as d3 from 'd3';
	
	let el:HTMLElement;

  onMount(() => {
    let processedData: Record<string, number> = {};
    let max:number = 0;

    console.log(data)
  
    for (const vote of data) {
      let newScore = processedData[vote] ? processedData[vote] + 1 : 1;
      processedData[vote] = newScore;

      max = Math.max(newScore, max)
    }

    const svg = d3.select('svg');

    // Set up scales
    const xScale = d3.scaleBand()
    .domain((Object.keys(processedData)).map((d, i) => i))
      .range([0, 300])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(Object.values(processedData))])
      .range([150, 0]);

    // Create bars
    svg.selectAll('rect')
      .data(Object.values(processedData))
      .enter().append('rect')
      .attr('x', (d:number, i:number) => xScale(i))
      .attr('y', (d:number) => yScale(d))
      .attr('width', xScale.bandwidth())
      .attr('height', (d:number) => 150 - yScale(d))
      .attr('fill', (d:number, i:number) => COLORS[i % COLORS.length]);
  });
</script>

<article class="chart">
  <svg width="300" height="150"></svg>
</article>

<style>
  rect {
    stroke: white;
  }
</style>