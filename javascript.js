document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map', {
        center: [53.821, 27.960],
        zoom: 7,
        zoomControl: false 
    });

    // Определение слоев
    var layerOSM = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://www.maptiler.com/copyright">MapTiler</a>'
    });
    var layerSatellite = L.tileLayer('https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=NpomKcFxorT43dOViHoV', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://www.maptiler.com/copyright">MapTiler</a>'
    });
    
    // Добавление начального слоя
    layerOSM.addTo(map);

    // Переключение подложек по радио-кнопкам
    var radio_podlozhka_shema = document.getElementById('radio-7');
    var radio_podlozhka_sputnik = document.getElementById('radio-8');

    radio_podlozhka_shema.addEventListener('change', function() {
        if (this.checked) {
            map.removeLayer(layerSatellite);
            layerOSM.addTo(map);
            markersGroup.addTo(map);
            document.querySelectorAll("hr").forEach(function (hr) { hr.style.backgroundColor = "#000000"; });
            document.getElementById('maschtab_text').style.color = "#000000";
        }
    });

    radio_podlozhka_sputnik.addEventListener('change', function() {
        if (this.checked) {
            map.removeLayer(layerOSM);
            layerSatellite.addTo(map);
            markersGroup.addTo(map);
            document.querySelectorAll("hr").forEach(function (hr) { hr.style.backgroundColor = "#b3b89c"; });
            document.getElementById('maschtab_text').style.color = "#b3b89c";
        }
    });

    document.getElementById('button_return').addEventListener('click', function() {
        map.setView([53.821, 27.960], 7);
    });
    document.getElementById('button_more_scale').addEventListener('click', function() {
        map.zoomIn();
    });
    document.getElementById('button_less_scale').addEventListener('click', function() {
        map.zoomOut();
    });
    var scaleRange = document.getElementById('scale_range');
    scaleRange.min = 0;
    scaleRange.max = 19;
    scaleRange.value = map.getZoom(); 
    scaleRange.addEventListener('input', function() {
        map.setZoom(this.value);
    });
    map.on('zoomend', function() {
        scaleRange.value = map.getZoom();
        updateScale();
    });
    map.on('moveend', updateScale);

    // Функция обновления масштаба
    function updateScale() {
        var scaleElement = document.getElementById('maschtab');
        var scaleText = document.getElementById('maschtab_text');


        
        // Вычисление ширины элемента масштаба
        var scaleWidth = scaleElement.offsetWidth;
        var mapSize = map.getSize();

        // Определяем широту на уровне линейки
        var mapBottomLeft = map.containerPointToLatLng([0, mapSize.y - 4]); // 4px от низа карты
        var mapBottomRight = map.containerPointToLatLng([mapSize.x, mapSize.y - 4]);
        
        // Вычисление реального расстояния, соответствующего ширине элемента масштаба
        var distance = map.distance(mapBottomLeft, mapBottomRight) * (scaleWidth / mapSize.x);
        
        // Определение подходящей единицы измерения и округление расстояния
        var unit = 'м';
        if (distance >= 1000) {
            distance = (distance / 1000).toFixed(1);
            unit = 'км';
        } else {
            distance = Math.round(distance);
        }

        // Обновление текста и ширины элемента масштаба
        scaleText.innerHTML = distance + ' ' + unit;
    }

    // Инициализация масштаба при загрузке карты
    updateScale();
     

    var latLngBounds = L.latLngBounds([[51.26269, 23.17833], [56.17225, 32.76276]]);
    var imageRadiation2006 = L.imageOverlay('materials/images/radiation_2006.svg', latLngBounds, {
        opacity: 0.6,
        interactive: true
    })
    var imageRadiation2046 = L.imageOverlay('materials/images/radiation_2046.svg', latLngBounds, {
        opacity: 0.6,
        interactive: true
    })




    function switchOverlay(overlay) {
        map.eachLayer(function (layer) {
            if (layer instanceof L.ImageOverlay || layer instanceof L.LayerGroup) {
                map.removeLayer(layer);
            }
        });
        if (overlay) {
            overlay.addTo(map);
        }
    }

    var radio_radiation_2006 = document.getElementById('radio-5');
    var radio_radiation_2046 = document.getElementById('radio-6');

    radio_radiation_2006.addEventListener('change', function() {
        if (this.checked) { switchOverlay(imageRadiation2006); markersGroup.addTo(map); }
    });
    radio_radiation_2046.addEventListener('change', function() {
        if (this.checked) { switchOverlay(imageRadiation2046); markersGroup.addTo(map); }
    });

    switchOverlay(imageRadiation2006);

    opacity_range.addEventListener('input', function() {
        var newOpacity = parseFloat(this.value);
        imageRadiation2006.setOpacity(newOpacity);
        imageRadiation2046.setOpacity(newOpacity);
    });


    const searchContainer = document.getElementById('search');
    const searchInput = document.getElementById('search_text');
    const searchButton = document.getElementById('button_search');

    // Функция для выполнения поиска
    function performSearch(query) {
        if (query) {
            const geocoder = L.Control.Geocoder.nominatim();
            geocoder.geocode(query, function(results) {
                if (results && results.length > 0) {
                    const result = results[0];
                    
                    // Проверяем наличие bbox
                    if (result.bbox) {
                        const bbox = result.bbox;
                        // Проверяем, что координаты корректны
                        if (bbox[0] !== undefined && bbox[1] !== undefined && bbox[2] !== undefined && bbox[3] !== undefined) {
                            map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]]);
                        } else {
                            // console.warn("Некорректные границы (bbox), использование центральной точки вместо этого.");
                            if (result.center && result.center.lat !== undefined && result.center.lng !== undefined) {
                                map.setView(result.center, 13); // Если bbox некорректен, используем центр
                            } else {
                                alert("Не удалось найти корректные данные для данного места");
                            }
                        }
                    } else if (result.center) {
                        // Если bbox нет, используем центральную точку
                        if (result.center.lat !== undefined && result.center.lng !== undefined) {
                            map.setView(result.center, 13);
                        } else {
                            alert("Некорректная центральная точка для данного места");
                        }
                    } else {
                        alert("Не удалось найти координаты для данного места");
                    }
                } else {
                    alert("Ничего не найдено");
                }
            });
        }
    }

    // Событие на кнопку поиска
    searchButton.addEventListener('click', function(e) {
        // e.stopPropagation();
        if (searchContainer.classList.contains('expanded')) {
            performSearch(searchInput.value);
            // searchContainer.classList.remove('expanded');
        } else {
            searchContainer.classList.add('expanded');
            searchInput.focus();
        }
    });

    // Событие нажатия клавиши Enter в поле поиска
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Предотвращаем отправку формы, если она существует
            performSearch(searchInput.value);
        }
    });


    // Скрытие поиска при клике в любом другом месте, кроме случаев выделения текста
    document.addEventListener('click', function(e) {
        if (!searchContainer.contains(e.target)) {
            searchContainer.classList.remove('expanded');
            searchInput.value = "";
        }
    });

    // Остановка сокрытия поиска при клике внутри него
    searchContainer.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Остановка сокрытия поиска при выделении текста (когда мышь отпущена вне элемента)
    searchInput.addEventListener('mouseup', function(e) {
        e.stopPropagation();
    });


});

