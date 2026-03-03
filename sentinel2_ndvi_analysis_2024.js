//// NDVI////analysis
// Create image collection of S-2 imagery for the perdiod 2024
var S2 = ee.ImageCollection('COPERNICUS/S2')

//filter start and end date
.filterDate('2024-04-01', '2024-07-30')

//filter according to drawn boundary
.filterBounds(aoi);
print(S2);
Map.addLayer(aoi);
// Function to mask cloud from built-in quality band
// information on cloud
var maskcloud1 = function(image) {
var QA60 = image.select(['QA60']);
return image.updateMask(QA60.lt(1));
};

// Function to calculate and add an NDVI band
var addNDVI = function(image) {
return image.addBands(image.normalizedDifference(['B8', 'B4']));
};

// Add NDVI band to image collection
var S2 = S2.map(addNDVI);

// Extract NDVI band and create NDVI median composite image
var NDVI = S2.select(['nd']);
var NDVI = NDVI.median();

// Create palettes for display of NDVI
var ndvi_pal = ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b',
'#a6d96a'];

// Create a time series chart.
var plotNDVI = ui.Chart.image.seriesByRegion(S2, aoi,ee.Reducer.mean(),'nd',10,'system:time_start', 'system:index')
              .setChartType('LineChart').setOptions({
                title: 'NDVI short-term time series',
                hAxis: {title: 'Date'},
                vAxis: {title: 'NDVI'}
});

// Display.
print(plotNDVI);

// Display NDVI results on map
Map.addLayer(NDVI.clip(aoi), {min:-0.5, max:0.9, palette: ndvi_pal}, 'NDVI');

// Export the image, specifying scale and region.
Export.image.toDrive({
  image: NDVI.clip(aoi),
  description: 'NDVI',
  scale: 10,
  maxPixels: 1e9,
  region: aoi
});



//////


// Load the shapefile
var StudyArea = ee.FeatureCollection('projects/ee-akashnilkaibartta/assets/groundnut2024');

// Extract average NDVI values for each feature in the shapefile
var AvgNDVI = NDVI.reduceRegions({
  collection: StudyArea,
  reducer: ee.Reducer.mean(),
  scale: 10
});

// Print and export the result
print('Average NDVI:', AvgNDVI);
Export.table.toDrive({
  collection: AvgNDVI,
  description: 'AverageNDVIExport',
  fileFormat: 'CSV'
});


