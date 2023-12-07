function loadGeoJsonData() {
  return fetch('/hoseo_jooyeon_final/seoul_populationLatLng.geojson').then(response => response.json());
}

function filterGeoJson() {
  loadGeoJsonData().then(geoJsonData => {
    const minPop = parseInt(document.getElementById('minPopulation').value, 10);
    const maxPop = parseInt(document.getElementById('maxPopulation').value, 10);

    // 인구 범위에 따라 GeoJSON 데이터 필터링
    const filteredFeatures = geoJsonData.features.filter(feature => {
      const population = feature.properties.POP2008;
      return population >= minPop && population <= maxPop;
    });

    // 결과를 리스트로 표시
    displayResults(filteredFeatures);
  });
}
var currentPolygon = null; // 현재 활성화된 폴리곤을 추적하기 위한 전역 변수
function createPolygon(coordinates) {
  // 이전에 생성된 폴리곤이 있다면 지도에서 제거
  if (currentPolygon) {
    currentPolygon.setMap(null);
  }

  var path = coordinates.map(coord => new kakao.maps.LatLng(coord[1], coord[0]));

  var polygon = new kakao.maps.Polygon({
    map: map,
    path: path,
    strokeWeight: 3,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    fillColor: '#FF0000',
    fillOpacity: 0.7
  });

  // 현재 활성화된 폴리곤 업데이트
  currentPolygon = polygon;

  return polygon;
}

function getPolygonBounds(polygon) {
  var bounds = new kakao.maps.LatLngBounds();
  var path = polygon.getPath();

  path.forEach(function(point) {
    bounds.extend(point);
  });

  return bounds;
}

function displayResults(filteredFeatures) {
  const resultsContainer = document.getElementById('resultList');
  resultsContainer.innerHTML = ''; // 기존 결과 초기화

  // 테이블 생성
  const table = document.createElement('table');
  table.classList.add('results-table');

  // 테이블 헤더 추가
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  const headers = ['지역', '인구'];
  headers.forEach(headerText => {
    const headerCell = document.createElement('th');
    headerCell.textContent = headerText;
    headerRow.appendChild(headerCell);
  });

  // 테이블 바디 추가
  const tbody = table.createTBody();
  filteredFeatures.forEach(feature => {
    const row = tbody.insertRow();
    const cell1 = row.insertCell();
    cell1.textContent = feature.properties.EMD_NM; // '지역' 셀
    const cell2 = row.insertCell();
    cell2.textContent = feature.properties.POP2008; // '인구' 셀
  });

  // 결과 컨테이너에 테이블 추가
  resultsContainer.appendChild(table);

  // 테이블 클릭 이벤트
  tbody.addEventListener('click', function(e) {
    var clickedRow = e.target.closest('tr');
    var feature = filteredFeatures[clickedRow.rowIndex - 1];
    var coordinates = feature.geometry.coordinates[0];

    var polygon = createPolygon(coordinates);
    var bounds = getPolygonBounds(polygon);
    map.setBounds(bounds);
    console.log(bounds)
  });
}

function getMidPoint(firstCoord, middleCoord) {
  var midLat = (firstCoord.getLat() + middleCoord.getLat()) / 2;
  var midLng = (firstCoord.getLng() + middleCoord.getLng()) / 2;
  return new kakao.maps.LatLng(midLat, midLng);
}
