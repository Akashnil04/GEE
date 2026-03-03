Map.addLayer(roi)

var time_start = '2001', time_end = '2003'

var ndvi = ee.ImageCollection("MODIS/061/MOD13Q1")
.select(['NDVI'])
.filterDate(time_start, time_end);

print(ndvi)

// clculate the vci
// vegetation condition index
//vci = ((ndvi - min)/(max - min)) * 100

var ndvi_min = ndvi.min().multiply(0.0001);
var ndvi_max = ndvi.max().multiply(0.0001);

var vci = ndvi.map(function(img){
  var band = img.multiply(0.0001);
  var index = band.expression('((ndvi - min)/(max - min))*100.0',{
    'ndvi': band, 'min': ndvi_min, 'max': ndvi_max
    }).rename('vci');
  return index
  .copyProperties(img, ['system:time_start','system:time_end'])
  });
  
// drought mapping using vci

var vci_median = vci.median();

Map.addLayer(vci_median.clip(roi),[],'vci_median',false)

print(
  ui.Chart.image.histogram(vci_median, roi, 250)
  )

// vci classification

// making a constant image 

var cons = ee.Image.constant(0);

// define classes

var extreme = cons.where(vci_median.gte(0).and(vci_median.lt(10)), 1);
var severe = extreme.where(vci_median.gte(10).and(vci_median.lt(20)), 2);
var moderate = severe.where(vci_median.gte(20).and(vci_median.lt(30)), 3);
var light = moderate.where(vci_median.gte(30).and(vci_median.lt(40)), 4);
var no1 = light.where(vci_median.gte(40).and(vci_median.lt(60)), 5);
var no2 = no1.where(vci_median.gte(60).and(vci_median.lt(80)), 6);
var no3 = no2.where(vci_median.gte(80), 7);

Map.addLayer(moderate.clip(roi),{min:1, max: 7},'drought_map',false)

// vci classification for each date


var time_start = '2001', time_end = '2024'

var ndvi2 = ee.ImageCollection("MODIS/061/MOD13A2")
.select(['NDVI'])
.filterDate(time_start, time_end);

var ndvi_min2 = ndvi2.min().multiply(0.0001);
var ndvi_max2 = ndvi2.max().multiply(0.0001);

var vci2 = ndvi2.map(function(img){
  var band = img.multiply(0.0001);
  var index = band.expression('((ndvi - min)/(max - min))*100.0',{
    'ndvi': band, 'min': ndvi_min2, 'max': ndvi_max2
    }).rename('vci');
  return index
  .copyProperties(img, ['system:time_start','system:time_end'])
  });
  
  
print(vci2)
var vci_class = vci2.map(function(img){
  var cons = ee.Image.constant(0);
  var extreme = cons.where(vci_median.gte(0).and(vci_median.lt(10)), 1);
  var severe = extreme.where(vci_median.gte(10).and(vci_median.lt(20)), 2);
  var moderate = severe.where(vci_median.gte(20).and(vci_median.lt(30)), 3);
  var light = moderate.where(vci_median.gte(30).and(vci_median.lt(40)), 4);
  var no1 = light.where(vci_median.gte(40).and(vci_median.lt(60)), 5);
  var no2 = no1.where(vci_median.gte(60).and(vci_median.lt(80)), 6);
  var no3 = no2.where(vci_median.gte(80), 7);
  return no3
  .copyProperties(img, img.propertyNames())
  });
  
var vci_map = vci_class.mode();

Map.addLayer(vci_map.clip(roi),{palette: ['black','brown','red','orange','yellow', 'lightgreen','darkgreen'],
        min: 1, max: 7},'vci_mode', false)
// drought area calculation

var drought_area = (ee.Image.pixelArea().divide(1e6)).addBands(vci_map).clip(roi);
Map.addLayer(drought_area)
print(
  ui.Chart.image.byClass(drought_area, 'constant', 
  roi, ee.Reducer.sum(), 1000, ['nan','extreme drought','severe drought','moderate drought','light drought','no drought1','nodrought2','no drought3'])
  )