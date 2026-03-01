Map.addLayer(aoi)
var collectionA = ee.ImageCollection('COPERNICUS/S1_GRD').filterBounds(aoi)
  //Cloud filtering
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))  
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  // Filter to get images collected in interferometric wide swath mode.
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  // Filter to get images collected in ASCENDING mode.
  .filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'));
print('all collection VV+VH IW mode all dates', collectionA);
//VV and VH image selection
var vvA=collectionA.select('VV');
var vhA=collectionA.select('VH');
print('VV all dates', vvA);
print('VH all dates', vhA);

var vv1A=vvA.filterDate('2024-02-01', '2024-02-20').mosaic();
var vh1A=vhA.filterDate('2024-02-01', '2024-02-20').mosaic();

var vv2A=vvA.filterDate('2024-02-21', '2024-03-10').mosaic();
var vh2A=vhA.filterDate('2024-02-21', '2024-03-10').mosaic();

var vv3A=vvA.filterDate('2024-03-11', '2024-03-31').mosaic();
var vh3A=vhA.filterDate('2024-03-11', '2024-03-31').mosaic();

var vv4A=vvA.filterDate('2024-04-01', '2024-04-20').mosaic();
var vh4A=vhA.filterDate('2024-04-01', '2024-04-20').mosaic();

var vv5A=vvA.filterDate('2024-04-21', '2024-05-10').mosaic();
var vh5A=vhA.filterDate('2024-04-21', '2024-05-10').mosaic();

var vv6A=vvA.filterDate('2024-05-11', '2024-06-30').mosaic();
var vh6A=vhA.filterDate('2024-05-11', '2024-06-30').mosaic();


//Speckle filtering/smoothing
// Smooth the image by convolving with the boxcar kernel.
// Define a boxcar or low-pass kernel.
//A 3X3 Boxcar filter
var boxcar = ee.Kernel.square({radius: 1.5, units: 'pixels', normalize: true});

var vh1A = vh1A.convolve(boxcar);
var vv1A = vv1A.convolve(boxcar);

var vh2A = vh2A.convolve(boxcar);
var vv2A = vv2A.convolve(boxcar);

var vh3A = vh3A.convolve(boxcar);
var vv3A = vv3A.convolve(boxcar);

var vh4A = vh4A.convolve(boxcar);
var vv4A = vv4A.convolve(boxcar);

var vh5A = vh5A.convolve(boxcar);
var vv5A = vv5A.convolve(boxcar);

var vh6A = vh6A.convolve(boxcar);
var vv6A = vv6A.convolve(boxcar);

// Create band stack
var st_vvA = vv1A.addBands(vv2A).addBands(vv3A).addBands(vv4A)
.addBands(vv5A).addBands(vv6A);
print('Stacked VV_ASC', st_vvA);

var st_vhA=vh1A.addBands(vh2A).addBands(vh3A).addBands(vh4A).
addBands(vh5A).addBands(vh6A);
print('Stacked VH_ASC', st_vhA);

//------------------------------------------------------------------------------------------------------
// Make a handy variable of visualization parameters.
var visParamsvvA = {bands: ['VV', 'VV_2', 'VV_3'],min: -30,
  max: 0,
  gamma: [0.9, 0.8, 0.7]};
var visParamsvhA = {bands: ['VH', 'VH_2', 'VH_3'],min: -30,
  max: 0,gamma: [0.9, 0.8, 0.7]};
// Display map
Map.centerObject(aoi, 8);
// Display composite image
Map.addLayer(st_vvA.clip(aoi), visParamsvvA, 'Date stack VVASC');
Map.addLayer(st_vhA.clip(aoi), visParamsvhA, 'Date stack VHASC');
//Display individual data
Map.addLayer(vh3A.clip(aoi), {min:-30,max:0}, 'VHA');
//--------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------
//Masking: mask pixels of no interest
var urbanmask=(vv1A.lt(-7).and(vv2A.lt(-7)));
//Map.addLayer(classified.updateMask(urbanmask), {min: 1, max: 3, palette: palette}, 'Class Type');
var watermask=(vv5A.gt(-19).and(vh5A.gt(-21)));
//Apply mask
var st_vvA_M=st_vvA.updateMask(watermask).updateMask(urbanmask);
var st_vhA_M=st_vvA.updateMask(watermask).updateMask(urbanmask);
Map.addLayer(st_vvA.updateMask(watermask).updateMask(urbanmask),
visParamsvvA, 'Masked Image stack');
var st_vv_vhM=st_vvA_M.addBands(st_vhA_M);
Map.addLayer(st_vv_vhM.clip(aoi), visParamsvvA, 'Date stack VV-VH');
//---------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------------------------------------------
//Temporal analysis
// Create a chart/temporal analysis

// Define customization options.
var optionsvv = {
  title: 'Time Series sigma0_VH plot',
  hAxis: {title: 'Date'},
  vAxis: {title: 'Backscatter coefficient Sigma0_VH (dB)'},
  lineWidth: 2,
  pointSize: 4,
  fontSize:20,
  series: {
    0: {color: '970F0F'}, 
    1: {color: 'FF0000'}, 
    2: {color: 'F68244'}, 
    3: {color: '1230D8'}, 
    4: {color: '00F7FF'}, 
    5: {color: '0093FF'}, 
    6: {color: 'B455F1'}, 
    7: {color: 'EE37BA'}, 
    8: {color: '5711B0'}, 
    9: {color: 'AEF712'}, 
    10: {color: '06F70E'}, 
    11: {color: '08690B'}, 
    12: {color: 'E074B7'}, 
    13: {color: '610808'}, 
    14: {color: '0F9728'}, 
    15: {color: 'E074B7'}, 
    16: {color: 'E074B7'}, 
    17: {color: 'E074B7'}, 
    18: {color: 'E074B7'}, 
    19: {color: 'E074B7'}, 
    20: {color: 'E074B7'}, 
    21: {color: 'E074B7'}, 
    22: {color: 'E074B7'}, 
    23: {color: 'E074B7'}, 
    24: {color: 'E074B7'}, 
    25: {color: 'E074B7'},
    26: {color: 'E074B7'} 
    
}};

//['11May','23May','04Jun','28jun','10Jul','22Jul','03Aug','15Aug','27Aug','08Sep','20Sep','02Oct','14Oct','26Oct','07Nov','19Nov','01Dec','13Dec','25Dec']
// Define dates for X-axis labels.
var dates = ['15Apr','01May','15May', '10June','25June','15July',];
// Define and display a FeatureCollection of ground data locations.
//-----------------------------------------------
//Map.addLayer(Q1).select(Plot);
var Q1 = Q1.select(['Plot']);
Map.addLayer(Q1, {}, 'Selected Bands Layer');
// Create the chart and set options.
//VV Plot
var timeChartvvQ1= ui.Chart.image.regions(
    st_vvA, Q1, ee.Reducer.mean(), 20, 'label', dates)
        .setChartType('LineChart')
        .setOptions(optionsvv);
// Display the chart.
print('Timeseries VV Plot1',timeChartvvQ1);
//VH plot
var timeChartvhQ1 = ui.Chart.image.regions(
    st_vhA, Q1, ee.Reducer.mean(), 20, 'label', dates)
        .setChartType('LineChart')
        .setOptions(optionsvv);
// Display the chart.
print('Timeseries VH Plot1',timeChartvhQ1);
//---------------------------------------------------------------------------------


//---------------------------------------------------------------------------------
// Unsupervised Classification (clustering)
// Make the training dataset
var training = st_vv_vhM.sample({
  region: aoi,
  scale: 10,
  numPixels: 5000
});
// Instantiate the clusterer and train it.
var clusterer = ee.Clusterer.wekaKMeans(4).train(training);

// Cluster the input using the trained clusterer.
var result = st_vv_vhM.cluster(clusterer).clip(aoi);

// Display the clusters with random colors.
Map.addLayer(result.randomVisualizer(), {}, 'clusters');
//----------------------------------------------------------------------------------
// Export the image, specifying scale and region.
Export.image.toDrive({
  image: result,
  description: 'Groundnut_Map',
  scale: 10,
  region: aoi
});

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




// ----------------------------
// VCI (Vegetation Condition Index) calculation
// ----------------------------

//  Select NDVI band (already computed earlier)
var NDVI = S2.select('nd');

// Compute per-pixel min and max NDVI over the time period
var ndviMin = NDVI.min();
var ndviMax = NDVI.max();

//Compute VCI
var VCI = NDVI.map(function(img) {
  var vci = img.subtract(ndviMin)
               .divide(ndviMax.subtract(ndviMin))
               .multiply(100)
               .rename('VCI');
  return vci.copyProperties(img, ['system:time_start']);
});

// Create median VCI composite
var VCI_median = VCI.median();

// Visualization palette
var vci_pal = ['#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#1a9850'];

// Step 6: Display VCI
Map.addLayer(VCI_median.clip(aoi), {min: 0, max: 100, palette: vci_pal}, 'VCI');

//Export VCI image
Export.image.toDrive({
  image: VCI_median.clip(aoi),
  description: 'VCI',
  scale: 10,
  maxPixels: 1e9,
  region: aoi
});

//  Time series chart for VCI
var plotVCI = ui.Chart.image.seriesByRegion(VCI, aoi, ee.Reducer.mean(), 'VCI', 100, 'system:time_start')
              .setChartType('LineChart')
              .setOptions({
                title: 'VCI short-term time series',
                hAxis: {title: 'Date'},
                vAxis: {title: 'VCI (%)'}
              });

print(plotVCI);

// Extract average NDVI values for each feature in the shapefile
var AvgVCI = VCI_median.reduceRegions({
  collection: StudyArea,
  reducer: ee.Reducer.mean(),
  scale: 10
});

// Print and export the result
print('Average VCI:', AvgVCI);
Export.table.toDrive({
  collection: AvgVCI,
  description: 'AverageVCIExport',
  fileFormat: 'CSV'
});


//// CI_Green Analysis ////

// Create image collection of S-2 imagery for the period 2024-04-01 to 2024-07-30(edited for 15.05 to 30.06)
var S2 = ee.ImageCollection('COPERNICUS/S2')
  .filterDate('2024-02-15', '2024-06-15')
  .filterBounds(aoi);

// Function to mask cloud from built-in quality band (QA60)
var maskcloud1 = function(image) {
  var QA60 = image.select(['QA60']);
  return image.updateMask(QA60.lt(1));
};

// Function to calculate CI_Green = (NIR / Green) - 1
var addCIGreen = function(image) {
  var ci_green = image.select('B8').divide(image.select('B3')).subtract(1).rename('ci_green');
  return image.addBands(ci_green);
};

// Apply function to image collection
var S2 = S2.map(addCIGreen);

// Extract CI_Green band and create median composite
var CIGreen = S2.select(['ci_green']).median();

// Visualization palette
var ci_pal = ['#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#1a9850'];

// Create a time series chart for CI_Green
var plotCIGreen = ui.Chart.image.seriesByRegion(
    S2, aoi, ee.Reducer.mean(), 'ci_green', 10, 'system:time_start', 'system:index')
    .setChartType('LineChart')
    .setOptions({
      title: 'CI_Green Short-term Time Series',
      hAxis: {title: 'Date'},
      vAxis: {title: 'CI_Green'}
    });

// Display chart
print(plotCIGreen);

// Display CI_Green map
Map.addLayer(CIGreen.clip(aoi), {min: 0, max: 5, palette: ci_pal}, 'CI_Green');

// Export CI_Green raster
Export.image.toDrive({
  image: CIGreen.clip(aoi),
  description: 'CI_Green',
  scale: 10,
  maxPixels: 1e9,
  region: aoi
});

//// Extracting average CI_Green values for shapefile features ////

// Load the shapefile
var StudyArea = ee.FeatureCollection('projects/ee-akashnilkaibartta/assets/groundnut2024');

// Extract average CI_Green values for each feature
var AvgCIGreen = CIGreen.reduceRegions({
  collection: StudyArea,
  reducer: ee.Reducer.mean(),
  scale: 10
});

// Print and export table
print('Average CI_Green:', AvgCIGreen);
Export.table.toDrive({
  collection: AvgCIGreen,
  description: 'NewCIGreenExportNCURB',
  fileFormat: 'CSV'
});

//// GNDVI

var S2 = ee.ImageCollection('COPERNICUS/S2')
  .filterDate('2024-02-15', '2024-06-15')
  .filterBounds(aoi);

// Cloud mask using QA60
var maskcloud1 = function(image) {
  var QA60 = image.select(['QA60']);
  return image.updateMask(QA60.lt(1));
};

// Function to calculate GNDVI = (NIR - Green) / (NIR + Green)
var addGNDVI = function(image) {
  var gndvi = image.normalizedDifference(['B8', 'B3']).rename('gndvi');
  return image.addBands(gndvi);
};

// Apply function to image collection
var S2 = S2.map(addGNDVI);

// Extract GNDVI band and create median composite
var GNDVI = S2.select(['gndvi']).median();

// Visualization palette
var gndvi_pal = ['#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#1a9850'];

// Time series chart
var plotGNDVI = ui.Chart.image.seriesByRegion(
    S2, aoi, ee.Reducer.mean(), 'gndvi', 10, 'system:time_start', 'system:index')
    .setChartType('LineChart')
    .setOptions({
      title: 'GNDVI Short-term Time Series',
      hAxis: {title: 'Date'},
      vAxis: {title: 'GNDVI'}
    });

print(plotGNDVI);

// Display GNDVI composite on map
Map.addLayer(GNDVI.clip(aoi), {min:-0.5, max:0.9, palette: gndvi_pal}, 'GNDVI');

// Export raster
Export.image.toDrive({
  image: GNDVI.clip(aoi),
  description: 'GNDVI',
  scale: 10,
  maxPixels: 1e9,
  region: aoi
});

// Load the shapefile
var StudyArea = ee.FeatureCollection('projects/ee-akashnilkaibartta/assets/groundnut2024');

// Extract average GNDVI values per feature
var AvgGNDVI = GNDVI.reduceRegions({
  collection: StudyArea,
  reducer: ee.Reducer.mean(),
  scale: 10
});

print('Average GNDVI:', AvgGNDVI);

// Export CSV
Export.table.toDrive({
  collection: AvgGNDVI,
  description: 'NewGNDVIExportNCURB',
  fileFormat: 'CSV'
});





//// Vegetation Indices Analysis with Sentinel-2 ////

// Create image collection of S-2 imagery
var S2 = ee.ImageCollection('COPERNICUS/S2')
  .filterDate('2024-05-15', '2024-06-30')
  .filterBounds(aoi);

// Cloud mask function (QA60 band)
var maskcloud1 = function(image) {
  var QA60 = image.select(['QA60']);
  return image.updateMask(QA60.lt(1));
};

// Function to calculate vegetation indices
var addIndices = function(image) {
  var nir = image.select('B8');   // NIR
  var red = image.select('B4');   // Red
  var green = image.select('B3'); // Green
  var blue = image.select('B2');  // Blue

// Define constants as ee.Number
var L = ee.Number(0.5);   // Soil brightness correction factor
var s = ee.Number(1.0);   // Soil line slope
var a = ee.Number(0.08);  // Soil line intercept
var X = ee.Number(0.08);  // Adjustment factor for TSAVI
var c = ee.Number(0.08);  // Weight factor

var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
var ci_green = nir.divide(green).subtract(1).rename('CI_Green');
var gndvi = nir.subtract(green).divide(nir.add(green)).rename('GNDVI');
var savi = nir.subtract(red).multiply(ee.Number(1).add(L))
              .divide(nir.add(red).add(L)).rename('SAVI');
var sr = nir.divide(red).rename('SR');

// PVI
var pvi = nir.subtract(red.multiply(s)).subtract(a)
             .divide(s.pow(2).add(1).sqrt())
             .rename('PVI');

// TSAVI
var tsavi = nir.subtract(red.multiply(s)).subtract(a)
               .divide(nir.multiply(s).add(red.multiply(c))
               .add(X.multiply(s.pow(2).add(1))))
               .rename('TSAVI');


var vari = green.subtract(red).divide(green.add(red).subtract(blue)).rename('VARI');

// MTVI (Modified Triangular Vegetation Index, MTVI1 variant)
var mtvi = nir.subtract(green.multiply(1.2)).subtract(red.multiply(2.5))
              .rename('MTVI');

  return image
    .addBands([ndvi, ci_green, gndvi, savi, sr, pvi, tsavi, vari, mtvi]);
};

// Map function to add indices
var S2 = S2.map(addIndices);

// Take median composite for each index
var indices = {
  NDVI: S2.select('NDVI').median(),
  CI_Green: S2.select('CI_Green').median(),
  GNDVI: S2.select('GNDVI').median(),
  SAVI: S2.select('SAVI').median(),
  SR: S2.select('SR').median(),
  PVI: S2.select('PVI').median(),
  TSAVI: S2.select('TSAVI').median(),
  VARI: S2.select('VARI').median(),
  MTVI: S2.select('MTVI').median()
};

// Visualization palettes
var ndvi_pal = ['#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#1a9850'];

// Display NDVI and other indices
Map.addLayer(indices.NDVI.clip(aoi), {min:-0.5, max:0.9, palette: ndvi_pal}, 'NDVI');
Map.addLayer(indices.CI_Green.clip(aoi), {min:0, max:3, palette:['blue','green','yellow','red']}, 'CI_Green');
Map.addLayer(indices.GNDVI.clip(aoi), {min:-0.5, max:0.9, palette: ndvi_pal}, 'GNDVI');
Map.addLayer(indices.SAVI.clip(aoi), {min:-0.5, max:0.9, palette: ndvi_pal}, 'SAVI');
Map.addLayer(indices.SR.clip(aoi), {min:0, max:10, palette:['blue','green','yellow','red']}, 'SR');
Map.addLayer(indices.PVI.clip(aoi), {min:-5, max:5, palette:['brown','yellow','green']}, 'PVI');
Map.addLayer(indices.TSAVI.clip(aoi), {min:-1, max:1, palette:['red','yellow','green']}, 'TSAVI');
Map.addLayer(indices.VARI.clip(aoi), {min:-1, max:1, palette:['blue','yellow','green']}, 'VARI');
Map.addLayer(indices.MTVI.clip(aoi), {min:-2, max:2, palette:['purple','yellow','green']}, 'MTVI');

// Print one example
print('NDVI Median:', indices.NDVI);
print('CI_Green Median:', indices.CI_Green);
print('GNDVI Median:', indices.GNDVI);
print('SAVI Median:', indices.SAVI);
print('SR Median:', indices.SR);
print('PVI Median:', indices.PVI);
print('TSAVI Median:', indices.TSAVI);
print('VARI Median:', indices.VARI);
print('MTVI Median:', indices.MTVI);













// Load Sentinel-1 SAR data
var sentinel1 = ee.ImageCollection('COPERNICUS/S1_GRD')
                  .filterBounds(aoi)
                  .filterDate('2024-06-01', '2024-06-30')
                  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
                  .select('VV');

// Calculate mean backscatter over the area
var meanBackscatter = sentinel1.mean();


// Load the shapefile containing Nut Weight data
var cropWtShp = ee.FeatureCollection('projects/ee-akashnilkaibartta/assets/groundnut2024');
// Rasterize the shapefile (if it's polygonal or point data you want as raster)
var cropWtRaster = cropWtShp
  .filterBounds(aoi) // Ensure it's within your area of interest
  .reduceToImage({
    properties: ['Nut_wt'],  // The property in your shapefile that represents crop height
    reducer: ee.Reducer.mean()
  })
  .rename('Nut_Wt');  // Rename the band to something meaningful

// Calculate mean backscatter over the area
var meanBackscatter = sentinel1.mean().rename('backscatter');

// Combine the crop height raster with the SAR backscatter image
var comparison = cropWtRaster.addBands(meanBackscatter);

// Now you can use this combined image for analysis
print(comparison);
Map.addLayer(comparison, {bands: ['backscatter'], min: -20, max: 0}, 'Backscatter');

Map.addLayer(comparison, {bands: ['Nut_Wt'], min: 0, max: 10}, 'Nut Weight');

// Perform linear regression
var regression = comparison.reduceRegion({
  reducer: ee.Reducer.linearRegression({
    numX: 1,  // Number of independent variables (e.g., height)
    numY: 1   // Number of dependent variables (e.g., backscatter)
  }),
  geometry: aoi,
  scale: 10,
  bestEffort: true
});

// Print regression results (coefficients, intercept)
print('Nut Weight Linear Regression Results:', regression);


// Load the shapefile containing BIomass Weight data
var cropBmShp = ee.FeatureCollection('projects/ee-akashnilkaibartta/assets/groundnut2024');
// Rasterize the shapefile (if it's polygonal or point data you want as raster)
var cropBmRaster = cropBmShp
  .filterBounds(aoi) // Ensure it's within your area of interest
  .reduceToImage({
    properties: ['Bm_wt'],  // The property in your shapefile that represents crop height
    reducer: ee.Reducer.mean()
  })
  .rename('Bm_wt');  // Rename the band to something meaningful

// Calculate mean backscatter over the area
var meanBackscatter = sentinel1.mean().rename('backscatter');

// Combine the crop height raster with the SAR backscatter image
var comparison = cropBmRaster.addBands(meanBackscatter);

// Now you can use this combined image for analysis
print(comparison);
Map.addLayer(comparison, {bands: ['backscatter'], min: -20, max: 0}, 'Backscatter');

Map.addLayer(comparison, {bands: ['Bm_wt'], min: 0, max: 10}, 'Biomass Weight');

// Perform linear regression
var regression = comparison.reduceRegion({
  reducer: ee.Reducer.linearRegression({
    numX: 1,  // Number of independent variables (e.g., height)
    numY: 1   // Number of dependent variables (e.g., backscatter)
  }),
  geometry: aoi,
  scale: 10,
  bestEffort: true
});

// Print regression results (coefficients, intercept)
print('Biomass Linear Regression Results:', regression);


// Load the shapefile containing BIomass Weight data
var cropChlShp = ee.FeatureCollection('projects/ee-akashnilkaibartta/assets/groundnut2024');
// Rasterize the shapefile (if it's polygonal or point data you want as raster)
var cropChlRaster = cropChlShp
  .filterBounds(aoi) // Ensure it's within your area of interest
  .reduceToImage({
    properties: ['Chl_avg'],  // The property in your shapefile that represents crop height
    reducer: ee.Reducer.mean()
  })
  .rename('Chl_avg');  // Rename the band to something meaningful

// Calculate mean backscatter over the area
var meanBackscatter = sentinel1.mean().rename('backscatter');

// Combine the crop height raster with the SAR backscatter image
var comparison = cropChlRaster.addBands(meanBackscatter);

// Now you can use this combined image for analysis
print(comparison);
Map.addLayer(comparison, {bands: ['backscatter'], min: -20, max: 0}, 'Backscatter');

Map.addLayer(comparison, {bands: ['Chl_avg'], min: 0, max: 10}, 'Chlorophyll');

// Perform linear regression
var regression = comparison.reduceRegion({
  reducer: ee.Reducer.linearRegression({
    numX: 1,  // Number of independent variables (e.g., height)
    numY: 1   // Number of dependent variables (e.g., backscatter)
  }),
  geometry: aoi,
  scale: 10,
  bestEffort: true
});

// Print regression results (coefficients, intercept)
print('Chlorophyll Linear Regression Results:', regression);