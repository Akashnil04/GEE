Map.centerObject(geometry)

var time_start = '2020', time_end = '2021'

var sen1 = ee.ImageCollection("COPERNICUS/S1_GRD")
.filterDate(time_start, time_end)
.filterBounds(geometry)
.filter(ee.Filter.listContains('transmitterReceiverPolarisation','VV'))
.filter(ee.Filter.eq('instrumentMode','IW'))
.select('VV');

var asc = sen1
.filter(ee.Filter.eq('orbitProperties_pass','ASCENDING'));

var des = sen1
.filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'));


var sen1_monthly = ee.ImageCollection(ee.List.sequence(1,12).map(function(month){
  var asc_month = asc.filter(ee.Filter.calendarRange(month, month, 'month')).mean().rename('asc')
  var des_month = des.filter(ee.Filter.calendarRange(month, month, 'month')).mean().rename('des')
  var date = ee.Date.fromYMD(2020, month, 1)
  return asc_month.addBands(des_month)
  .set('system:time_start', date.millis())
  .set('system:index', date.format('YYYY-MM'))
  }))
  

var speckel = sen1_monthly.map(function(img){
  return img.focalMean(10, 'square', 'meters')
  .copyProperties(img, img.propertyNames())
  
  })

  
Map.addLayer(speckel.select('asc').toBands().clip(geometry), [], 'asc', false);
Map.addLayer(speckel.select('des').toBands().clip(geometry),[], 'des', false);




print(
  ui.Chart.image.series(sen1_monthly, geometry2, ee.Reducer.first(), 10, 'system:time_start')
  )

Export.image.toDrive({
  image: speckel.select('asc').toBands().clip(geometry), 
  description: 'sar_asc', 
  scale: 10, 
  region: geometry, 
  maxPixels: 1e13, 
  crs: 'EPSG:4326', 
  folder: 'test'
  })