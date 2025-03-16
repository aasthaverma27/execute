import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, ZoomControl, useMap, GeoJSON } from 'react-leaflet';
import { Map as LeafletMap, geoJSON } from 'leaflet';
import * as d3 from 'd3';
import 'leaflet/dist/leaflet.css';

interface MisinformationHeatmapProps {
  onClose: () => void;
}

// Sample data for testing
const sampleStories = [
  {
    title: "Election Misinformation Campaign",
    description: "Widespread false claims about election fraud detected across social media platforms",
    coordinates: [37.0902, -95.7129] as [number, number],
    spread: 75,
    verificationStatus: "fake" as const,
    region: "United States",
    date: "2024-03-16",
    category: "Political"
  },
  {
    title: "Health Misinformation Surge",
    description: "False medical advice about new treatment spreading rapidly in European countries",
    coordinates: [51.5074, -0.1278] as [number, number],
    spread: 60,
    verificationStatus: "likely_fake" as const,
    region: "United Kingdom",
    date: "2024-03-15",
    category: "Health"
  },
  {
    title: "Climate Change Denial Campaign",
    description: "Coordinated spread of misleading climate data and false scientific claims",
    coordinates: [20.5937, 78.9629] as [number, number],
    spread: 80,
    verificationStatus: "fake" as const,
    region: "India",
    date: "2024-03-16",
    category: "Science"
  }
];

// Analytics data
const analyticsData = {
  categories: [
    { name: "Political", count: 45, avgSpread: 75 },
    { name: "Health", count: 32, avgSpread: 60 },
    { name: "Science", count: 28, avgSpread: 55 },
    { name: "Technology", count: 20, avgSpread: 45 },
    { name: "Social", count: 15, avgSpread: 40 }
  ],
  trends: [
    { date: "2024-03-10", count: 10 },
    { date: "2024-03-11", count: 15 },
    { date: "2024-03-12", count: 12 },
    { date: "2024-03-13", count: 20 },
    { date: "2024-03-14", count: 25 },
    { date: "2024-03-15", count: 30 },
    { date: "2024-03-16", count: 35 }
  ]
};

// Random story generator for country clicks
const generateRandomStory = (countryName: string, coordinates: [number, number]) => {
  const categories = ["Political", "Health", "Science", "Technology", "Social"];
  const verificationStatuses = ["fake", "likely_fake"] as const;
  
  return {
    title: `${countryName} Misinformation Alert`,
    description: `Recent surge in misinformation detected in ${countryName}. Multiple sources reporting coordinated disinformation campaigns.`,
    coordinates,
    spread: Math.floor(Math.random() * 60) + 20, // Random spread between 20-80
    verificationStatus: verificationStatuses[Math.floor(Math.random() * verificationStatuses.length)],
    region: countryName,
    date: new Date().toISOString().split('T')[0],
    category: categories[Math.floor(Math.random() * categories.length)]
  };
};

// Map center updater component
function MapCenterUpdater({ coordinates }: { coordinates?: [number, number] }) {
  const map = useMap();
  
  if (coordinates) {
    map.flyTo(coordinates, 4, {
      duration: 1.5
    });
  }
  
  return null;
}

// Analytics Chart Component
function AnalyticsChart() {
  const chartRef = useRef<SVGSVGElement>(null);
  const trendChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const width = 600;
      const height = 300;
      const margin = { top: 20, right: 30, bottom: 40, left: 60 };

      const svg = d3.select(chartRef.current)
        .attr('width', width)
        .attr('height', height);

      svg.selectAll("*").remove();

      const x = d3.scaleBand()
        .domain(analyticsData.categories.map(d => d.name))
        .range([margin.left, width - margin.right])
        .padding(0.1);

      const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height - margin.bottom, margin.top]);

      // Add bars
      svg.selectAll("rect")
        .data(analyticsData.categories)
        .join("rect")
        .attr("x", d => x(d.name)!)
        .attr("y", d => y(d.avgSpread))
        .attr("width", x.bandwidth())
        .attr("height", d => height - margin.bottom - y(d.avgSpread))
        .attr("fill", "#ef4444")
        .attr("opacity", 0.7);

      // Add labels
      svg.selectAll(".bar-label")
        .data(analyticsData.categories)
        .join("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.name)! + x.bandwidth() / 2)
        .attr("y", d => y(d.avgSpread) - 5)
        .attr("text-anchor", "middle")
        .text(d => `${d.avgSpread}%`);

      // Add axes
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"));

      // Add title
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Average Spread by Category");
    }

    // Trend Chart
    if (trendChartRef.current) {
      const width = 600;
      const height = 200;
      const margin = { top: 20, right: 30, bottom: 40, left: 60 };

      const svg = d3.select(trendChartRef.current)
        .attr('width', width)
        .attr('height', height);

      svg.selectAll("*").remove();

      const x = d3.scaleTime()
        .domain(d3.extent(analyticsData.trends, d => new Date(d.date)) as [Date, Date])
        .range([margin.left, width - margin.right]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(analyticsData.trends, d => d.count)!])
        .range([height - margin.bottom, margin.top]);

      // Add line
      const line = d3.line<typeof analyticsData.trends[0]>()
        .x(d => x(new Date(d.date)))
        .y(d => y(d.count));

      svg.append("path")
        .datum(analyticsData.trends)
        .attr("fill", "none")
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("d", line);

      // Add dots
      svg.selectAll("circle")
        .data(analyticsData.trends)
        .join("circle")
        .attr("cx", d => x(new Date(d.date)))
        .attr("cy", d => y(d.count))
        .attr("r", 4)
        .attr("fill", "#ef4444");

      // Add axes
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(7).tickFormat(d3.timeFormat("%b %d") as any));

      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5));

      // Add title
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Daily Misinformation Trends");
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Total Stories</h3>
          <p className="text-3xl font-bold text-red-600">140</p>
          <p className="text-sm text-gray-500">Last 7 days</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Average Spread</h3>
          <p className="text-3xl font-bold text-red-600">55%</p>
          <p className="text-sm text-gray-500">Across all categories</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Most Active Region</h3>
          <p className="text-3xl font-bold text-red-600">North America</p>
          <p className="text-sm text-gray-500">45% of total stories</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <svg ref={chartRef}></svg>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <svg ref={trendChartRef}></svg>
      </div>
    </div>
  );
}

// Add GeoJSON type
interface CountryFeature {
  type: 'Feature';
  properties: {
    name: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface CountryGeoJSON {
  type: 'FeatureCollection';
  features: CountryFeature[];
}

export function MisinformationHeatmap({ onClose }: MisinformationHeatmapProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'analytics' | 'stories'>('global');
  const [selectedStory, setSelectedStory] = useState<typeof sampleStories[0] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>();
  const [stories, setStories] = useState(sampleStories);
  const [geoJsonData, setGeoJsonData] = useState<CountryGeoJSON | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap>(null);

  // Fetch GeoJSON data
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(response => response.json())
      .then(data => setGeoJsonData(data))
      .catch(error => console.error('Error loading GeoJSON:', error));
  }, []);

  const handleStoryClick = (story: typeof sampleStories[0]) => {
    setSelectedStory(story);
    setMapCenter(story.coordinates);
    if (activeTab !== 'global') {
      setActiveTab('global');
    }
  };

  const handleCountryClick = (feature: CountryFeature) => {
    const bounds = geoJSON(feature).getBounds();
    const center: [number, number] = [
      (bounds.getNorth() + bounds.getSouth()) / 2,
      (bounds.getEast() + bounds.getWest()) / 2
    ];
    
    const newStory = generateRandomStory(feature.properties.name, center);
    setStories(prev => [...prev, newStory]);
    setSelectedStory(newStory);
    setMapCenter(center);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Global Misinformation Heatmap</h1>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setActiveTab('global')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'global'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Global View
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'analytics'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('stories')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'stories'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Stories
              </button>
            </div>

            {activeTab === 'global' && (
              <div className="h-[600px] w-full relative">
                <MapContainer
                  center={[20, 0]}
                  zoom={2}
                  style={{ height: '100%', width: '100%' }}
                  ref={mapRef}
                  zoomControl={false}
                >
                  <ZoomControl position="bottomright" />
                  <MapCenterUpdater coordinates={mapCenter} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {geoJsonData && (
                    <GeoJSON
                      data={geoJsonData}
                      style={(feature) => ({
                        fillColor: hoveredCountry === feature?.properties.name ? '#fecaca' : '#fee2e2',
                        weight: 1,
                        opacity: 1,
                        color: '#ef4444',
                        fillOpacity: hoveredCountry === feature?.properties.name ? 0.3 : 0.1
                      })}
                      eventHandlers={{
                        click: (e) => {
                          e.originalEvent.stopPropagation();
                          if (e.layer.feature) {
                            handleCountryClick(e.layer.feature);
                          }
                        },
                        mouseover: (e) => {
                          if (e.layer.feature) {
                            setHoveredCountry(e.layer.feature.properties.name);
                            e.layer.setStyle({
                              fillColor: '#fecaca',
                              fillOpacity: 0.3
                            });
                          }
                        },
                        mouseout: (e) => {
                          if (e.layer.feature) {
                            setHoveredCountry(null);
                            e.layer.setStyle({
                              fillColor: '#fee2e2',
                              fillOpacity: 0.1
                            });
                          }
                        }
                      }}
                    />
                  )}
                  {stories.map((story, index) => (
                    <Circle
                      key={index}
                      center={story.coordinates}
                      radius={story.spread * 10000}
                      pathOptions={{
                        color: story === selectedStory ? '#ef4444' : '#f87171',
                        fillColor: story === selectedStory ? '#ef4444' : '#f87171',
                        fillOpacity: story === selectedStory ? 0.5 : 0.3,
                        weight: story === selectedStory ? 2 : 1
                      }}
                      eventHandlers={{
                        click: (e) => {
                          e.originalEvent.stopPropagation();
                          handleStoryClick(story);
                        }
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold">{story.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{story.description}</p>
                          <div className="mt-2 space-y-2">
                            <div>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                story.verificationStatus === 'fake' ? 'bg-red-100 text-red-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {story.verificationStatus.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              <span>{story.region} • {new Date(story.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Circle>
                  ))}
                </MapContainer>
                {hoveredCountry && (
                  <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md z-[1000]">
                    <p className="text-sm font-semibold">{hoveredCountry}</p>
                    <p className="text-xs text-gray-500">Click to detect misinformation</p>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md z-[1000]">
                  <h4 className="text-sm font-semibold mb-2">Legend</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-red-400 opacity-30 mr-2"></div>
                      <span className="text-xs text-gray-600">Low Spread</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-red-400 opacity-50 mr-2"></div>
                      <span className="text-xs text-gray-600">Medium Spread</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-red-400 opacity-70 mr-2"></div>
                      <span className="text-xs text-gray-600">High Spread</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <AnalyticsChart />
            )}

            {activeTab === 'stories' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story, index) => (
                  <div
                    key={index}
                    className={`bg-white border rounded-lg overflow-hidden shadow-sm transition-all duration-200 cursor-pointer ${
                      story === selectedStory 
                        ? 'ring-2 ring-red-500 shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleStoryClick(story)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{story.title}</h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          story.verificationStatus === 'fake' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {story.verificationStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{story.description}</p>
                      <div className="mt-2 space-y-2">
                        <div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-red-600 h-2.5 rounded-full"
                              style={{ width: `${story.spread}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">Spread: {story.spread}%</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <span>{story.region} • {new Date(story.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 