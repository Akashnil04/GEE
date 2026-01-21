var region = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[87.39358351876984, 23.798022875335135],
          [87.39358351876984, 23.540013379975115],
          [87.88355873277436, 23.540013379975115],
          [87.88355873277436, 23.798022875335135]]], null, false),
    geometryLabel1 = /* color: #98ff00 */ee.Geometry.Point([87.52581642320405, 23.55523862198927]),
    titleLabel = /* color: #ffc82d */ee.Geometry.Point([87.46246294052455, 23.55978396566349]),
    geometryGradientBar = 
    /* color: #bf04c2 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[87.62044827980819, 23.622486238453796],
          [87.62044827980819, 23.620697199176895],
          [87.62639205498519, 23.620697199176895],
          [87.62639205498519, 23.622486238453796]]], null, false),
    datePoint = /* color: #ff0000 */ee.Geometry.Point([87.41389536269274, 23.56361940229725]),
    table = ee.FeatureCollection("projects/ee-akashnilkaibartta/assets/bolpur");

// Get Sentinel-2 Surface Reflectance
var col = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(region)
  .filterDate('2025-01-01', '2026-01-01')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 40))
  .map(function(img) {

Map.addLayer(table)
    
    // NDVI calculation
    var ndvi = img.normalizedDifference(['B8', 'B4'])
      .multiply(10000)
      .rename('NDVI');
    
    return ndvi
      .copyProperties(img, ['system:time_start']);
  });


///Mask filter
var mask = ee.Geometry(table);



// Add DOY + formatted date property
col = col.map(function(img) {
  var doy  = ee.Date(img.get('system:time_start')).getRelative('day', 'year');
  var date = ee.Date(img.get('system:time_start')).format('YYYY-MM-dd');   // date string
  return img.set({
    'doy': doy,
    'date_str': date
  });
});

//Creating a filter to identify matching images between the distinct and complete collections
var distinctDOY = col.filterDate('2025-01-01', '2026-01-01');
var filter = ee.Filter.equals({leftField: 'doy', rightField: 'doy'});
var join = ee.Join.saveAll('doy_matches');
var joinCol = ee.ImageCollection(join.apply(distinctDOY, col, filter));

//Apply median reduction
var comp = joinCol.map(function(img) {
  var doyCol = ee.ImageCollection.fromImages(
    img.get('doy_matches')
  );
  return doyCol.reduce(ee.Reducer.median());
});

var comp = joinCol.map(function(img) {
  var doyCol  = ee.ImageCollection.fromImages(img.get('doy_matches'));
  var reduced = doyCol.reduce(ee.Reducer.median());
  var first   = ee.Image(doyCol.first());
  return reduced.copyProperties(first, ['system:time_start', 'date_str']);
});

// Define RGB visualization parameters
var visParams = {
  min: 0.0,
  max: 9000.0,
  palette: [
    'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901',
    '66A000', '529400', '3E8601', '207401', '056201', '004C00', '023B01',
    '012E01', '011D01', '011301'
  ],
};

//Labelling packages

var text = require('users/gena/packages:text');

var rgbVis = comp.map(function(img) {

  var textVis = {
    fontSize: 24,
    textColor: 'ffffff',
    outlineColor: '000000',
    outlineWidth: 1
  };

  // Location for date text
  var scale = 800;
  var locate = text.getLocation(
    datePoint,
    'bottom',
    '10%',
    '30%'
  );

var dateLabel = text.draw(
  ee.String(img.get('date_str')),
  datePoint,
  800,
  {
    fontSize: 24,
    textColor: '000000',
    outlineColor: 'ffffff',
    outlineWidth: 4
  }
).reproject({
  crs: 'EPSG:3857',
  scale: 30
});



  return img
    .visualize(visParams)
    .blend(dateLabel)
    .clip(mask);   // ← THIS IS CRITICAL
});


//Definiton of gif animation
var gifParams = {
  'region': region,
  'dimensions': 800,
  'crs': 'EPSG:3857',
  'framesPerSecond': 1,
  'format': 'gif',
  'label': 'dateLabel'
};

// Print the GIF
print(rgbVis.getVideoThumbURL(gifParams));


// Render the GIF animation
print(ui.Thumbnail(rgbVis, gifParams));


// Get list of dates for each image
var dates = comp.aggregate_array('date_str');
print('Dates for each NDVI image:', dates);


print(comp.first().get('date_str'));

comp = comp.sort('system:time_start');


