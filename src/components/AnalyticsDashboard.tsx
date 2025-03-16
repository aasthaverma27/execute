import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface AnalyticsData {
  date: string;
  spread: number;
  engagement: number;
}

const sampleData: AnalyticsData[] = [
  { date: '2024-01', spread: 30, engagement: 45 },
  { date: '2024-02', spread: 45, engagement: 60 },
  { date: '2024-03', spread: 60, engagement: 75 },
  { date: '2024-04', spread: 75, engagement: 90 },
  { date: '2024-05', spread: 90, engagement: 100 },
];

export function AnalyticsDashboard() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll("*").remove();

    const x = d3.scalePoint()
      .domain(sampleData.map(d => d.date))
      .range([margin.left, width - margin.right])
      .padding(0.5);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

    const line = d3.line<AnalyticsData>()
      .x(d => x(d.date)!)
      .y(d => y(d.spread));

    svg.append("path")
      .datum(sampleData)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("d", line);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-gray-500 text-sm">Total Stories</h3>
          <p className="text-2xl font-bold">1,234</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-gray-500 text-sm">Active Spread</h3>
          <p className="text-2xl font-bold">45%</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-gray-500 text-sm">Affected Regions</h3>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-gray-500 text-sm">Engagement Rate</h3>
          <p className="text-2xl font-bold">78%</p>
        </div>
      </div>
      <div className="flex justify-center">
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
}