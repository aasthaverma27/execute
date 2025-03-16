interface AnalysisResult {
  isManipulated: boolean;
  confidence: number;
  detectionMethod: string;
  manipulatedRegions?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  additionalInfo?: string;
}

interface AnalysisResultsProps {
  result: AnalysisResult | null;
  isLoading: boolean;
}

export function AnalysisResults({ result, isLoading }: AnalysisResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No analysis results available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <div className={`px-4 py-2 rounded-full ${
          result.isManipulated
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {result.isManipulated ? 'Manipulated' : 'Authentic'}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Confidence Level</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-red-600 h-2.5 rounded-full"
              style={{ width: `${result.confidence}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{result.confidence}% confidence</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Detection Method</h3>
          <p className="text-gray-600">{result.detectionMethod}</p>
        </div>

        {result.manipulatedRegions && result.manipulatedRegions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Manipulated Regions</h3>
            <div className="grid grid-cols-2 gap-4">
              {result.manipulatedRegions.map((region, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Region {index + 1}: ({region.x}, {region.y}) - {region.width}x{region.height}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.additionalInfo && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
            <p className="text-gray-600">{result.additionalInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
} 