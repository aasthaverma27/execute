# Misinformation Heatmap Visualization

An interactive web application that visualizes the spread of misinformation across the globe using a heatmap and analytics dashboard.

## Features

- **Global Heatmap**: Visualize the spread of misinformation across different regions
- **Analytics Dashboard**: Track key metrics and trends
- **Story Tracking**: Monitor specific misinformation stories and their spread
- **Interactive UI**: Modern, responsive design with real-time updates

## Tech Stack

- React + TypeScript
- Vite
- Leaflet for map visualization
- D3.js for data visualization
- Tailwind CSS for styling
- Headless UI for accessible components

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd misinformation-heatmap
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
  ├── components/
  │   └── AnalyticsDashboard.tsx
  ├── App.tsx
  ├── main.tsx
  └── index.css
```

## Features in Detail

### Global Heatmap
- Interactive world map showing misinformation spread
- Color-coded intensity based on spread rate
- Click to zoom and pan
- Real-time updates

### Analytics Dashboard
- Key metrics visualization
- Spread over time charts
- Category distribution
- Engagement metrics

### Story Tracking
- List of trending misinformation stories
- Spread percentage visualization
- Geographic impact tracking
- Story selection and filtering

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenStreetMap for map tiles
- Leaflet.js for map functionality
- D3.js for data visualization
