function showLocationStatus(message, type = 'info', duration = 3000) {
    const locationStatus = document.getElementById('location-status');
    if (!locationStatus) return;

    locationStatus.innerHTML = `
        <div class="location-${type}">
            <i class="fas fa-${getStatusIcon(type)}"></i>
            <span>${message}</span>
            ${type === 'error' ? '<button onclick="getUserLocation()">Try Again</button>' : ''}
        </div>
    `;

    // Auto-hide success messages after duration
    if (type === 'success') {
        setTimeout(() => {
            locationStatus.innerHTML = '';
        }, duration);
    }
}

function getStatusIcon(type) {
    switch(type) {
        case 'info': return 'location-arrow';
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        default: return 'info-circle';
    }
}

// Get user location when the app starts
let userLocation = null;

function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            showLocationStatus('Geolocation is not supported by your browser', 'error');
            reject('Geolocation not supported');
            return;
        }

        showLocationStatus('Getting your location...', 'info');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                showLocationStatus('Location found!', 'success', 3000);
                resolve(userLocation);
            },
            (error) => {
                let errorMessage = 'Error getting location: ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please enable location access';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Request timed out';
                        break;
                    default:
                        errorMessage += 'Unknown error';
                }
                showLocationStatus(errorMessage, 'error');
                reject(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}

// When app loads, request location
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const locationStatus = document.createElement('div');
        locationStatus.id = 'location-status';
        document.querySelector('.main-content').prepend(locationStatus);

        locationStatus.innerHTML = `
            <div class="location-prompt">
                <i class="fas fa-location-arrow"></i>
                <span>Getting your location...</span>
            </div>
        `;

        await getUserLocation();
        
        locationStatus.innerHTML = `
            <div class="location-success">
                <i class="fas fa-check-circle"></i>
                <span>Location found! You can now search for destinations.</span>
            </div>
        `;

        // Enable search only after getting location
        document.getElementById('destination-search').disabled = false;
        document.getElementById('search-btn').disabled = false;

    } catch (error) {
        locationStatus.innerHTML = `
            <div class="location-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>${error}</span>
                <button onclick="getUserLocation()">Try Again</button>
            </div>
        `;
    }
});



class RouteCalculator {
    constructor(network) {
        this.network = network;
    }

    calculateRoute(startId, endId) {
        const graph = this.buildGraph();
        const { path, transfers } = this.findShortestPath(graph, startId, endId);
        return this.formatRoute(path, transfers);
    }

    buildGraph() {
        const graph = {};

        // Process each line
        Object.entries(this.network.stations).forEach(([lineName, stations]) => {
            stations.forEach((station, index) => {
                if (!graph[station.id]) {
                    graph[station.id] = {
                        connections: {},
                        line: lineName,
                        name: station.name
                    };
                }

                // Connect to next station on same line
                if (index < stations.length - 1) {
                    const nextStation = stations[index + 1];
                    graph[station.id].connections[nextStation.id] = {
                        weight: 3, // Minutes between stations
                        line: lineName
                    };
                    if (!graph[nextStation.id]) {
                        graph[nextStation.id] = {
                            connections: {},
                            line: lineName,
                            name: nextStation.name
                        };
                    }
                    graph[nextStation.id].connections[station.id] = {
                        weight: 3,
                        line: lineName
                    };
                }

                // Add interchange connections
                if (station.isInterchange) {
                    station.connectsWith.forEach(otherLine => {
                        const interchangeStation = this.network.stations[otherLine]
                            .find(s => s.name === station.name);
                        if (interchangeStation) {
                            graph[station.id].connections[interchangeStation.id] = {
                                weight: 5, // Transfer time
                                line: otherLine,
                                isTransfer: true
                            };
                        }
                    });
                }
            });
        });

        return graph;
    }

    findShortestPath(graph, start, end) {
        const distances = {};
        const previous = {};
        const transfers = {};
        const nodes = new Set();

        // Initialize
        Object.keys(graph).forEach(node => {
            distances[node] = Infinity;
            nodes.add(node);
        });
        distances[start] = 0;

        while (nodes.size > 0) {
            const current = Array.from(nodes)
                .reduce((min, node) => 
                    distances[node] < distances[min] ? node : min
                );

            if (current === end) break;

            nodes.delete(current);

            Object.entries(graph[current].connections).forEach(([neighbor, connection]) => {
                const alt = distances[current] + connection.weight;
                if (alt < distances[neighbor]) {
                    distances[neighbor] = alt;
                    previous[neighbor] = current;
                    transfers[neighbor] = connection.isTransfer;
                }
            });
        }

        // Reconstruct path
        const path = [];
        let current = end;
        while (current) {
            path.unshift({
                id: current,
                name: graph[current].name,
                line: graph[current].line,
                isTransfer: transfers[current]
            });
            current = previous[current];
        }

        return { path, totalTime: distances[end] };
    }

    calculateTravelTime(path) {
        let totalTime = 0;
        let transfers = 0;

        // Calculate time between consecutive stations
        for (let i = 0; i < path.length - 1; i++) {
            const currentStation = path[i];
            const nextStation = path[i + 1];

            if (currentStation.line !== nextStation.line) {
                totalTime += 5; // 5 minutes for transfer
                transfers++;
            } else {
                totalTime += 3; // 3 minutes between stations on same line
            }
        }

        return {
            totalTime,
            transfers,
            stations: path.length - 1
        };
    }

    formatRoute(path, totalTime) {
        let currentLine = path[0].line;
        const steps = [];
        let totalStations = 0;

        path.forEach((station, index) => {
            if (index === 0) {
                steps.push({
                    type: 'start',
                    station: station.name,
                    line: station.line
                });
            } else {
                if (station.isTransfer) {
                    steps.push({
                        type: 'transfer',
                        station: station.name,
                        fromLine: currentLine,
                        toLine: station.line
                    });
                    currentLine = station.line;
                } else {
                    totalStations++;
                }
            }
        });

        steps.push({
            type: 'end',
            station: path[path.length - 1].name
        });

        const timeInfo = this.calculateTravelTime(path);

        return {
            steps,
            totalTime: timeInfo.totalTime,
            totalStations: timeInfo.stations,
            transfers: timeInfo.transfers
        };
    }

    initializeEventListeners() {
        const findRouteBtn = document.getElementById('find-route');
        if (findRouteBtn) {
            findRouteBtn.addEventListener('click', () => {
                const startId = document.getElementById('start-station').value;
                const endId = document.getElementById('end-station').value;

                if (!startId || !endId) {
                    alert('Please select both stations');
                    return;
                }

                const route = this.calculateRoute(startId, endId);
                if (route) {
                    this.displayRoute(route);
                }
            });
        }
    }

    displayRoute(route) {
        const resultsDiv = document.getElementById('route-results');
        let html = '<div class="route-details">';

        // Add journey summary
        html += `
            <div class="journey-summary">
                <div class="time-info">
                    <i class="fas fa-clock"></i>
                    <span>${route.totalTime} minutes</span>
                </div>
                <div class="stats-info">
                    <span>${route.totalStations} stations</span>
                    ${route.transfers > 0 ? ` • ${route.transfers} transfer${route.transfers > 1 ? 's' : ''}` : ''}
                </div>
            </div>
        `;

        route.steps.forEach(step => {
            switch(step.type) {
                case 'start':
                    html += `
                        <div class="route-step start">
                            <div class="step-indicator" style="background-color: ${this.getLineColor(step.line)}">
                                <i class="fas fa-play"></i>
                            </div>
                            <div class="step-info">
                                <div class="step-title">Start at</div>
                                <div class="station-name">${step.station}</div>
                                <div class="line-name">${this.formatLineName(step.line)}</div>
                            </div>
                        </div>
                    `;
                    break;

                case 'transfer':
                    html += `
                        <div class="route-step transfer">
                            <div class="step-indicator">
                                <i class="fas fa-exchange-alt"></i>
                            </div>
                            <div class="step-info">
                                <div class="step-title">Transfer at</div>
                                <div class="station-name">${step.station}</div>
                                <div class="transfer-lines">
                                    From ${this.formatLineName(step.fromLine)} to ${this.formatLineName(step.toLine)}
                                </div>
                            </div>
                        </div>
                    `;
                    break;

                case 'end':
                    html += `
                        <div class="route-step end">
                            <div class="step-indicator">
                                <i class="fas fa-location-dot"></i>
                            </div>
                            <div class="step-info">
                                <div class="step-title">Arrive at</div>
                                <div class="station-name">${step.station}</div>
                            </div>
                        </div>
                    `;
                    break;
            }
        });

        html += '</div>';
        resultsDiv.innerHTML = html;
    }

    getLineColor(line) {
        const colors = {
            purpleLine: '#9B59B6',
            yellowLine: '#F1C40F',
            redLine: '#E74C3C'
        };
        return colors[line] || '#333';
    }

    formatLineName(line) {
        return line.replace('Line', '').charAt(0).toUpperCase() + 
               line.slice(1).replace('Line', '') + ' Line';
    }
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', () => {
    const routeCalculator = new RouteCalculator(metroNetwork);
    routeCalculator.initializeEventListeners();

    const startSelect = document.getElementById('start-station');
    const endSelect = document.getElementById('end-station');
    
    // Clear existing options
    startSelect.innerHTML = '<option value="">Select Starting Station</option>';
    endSelect.innerHTML = '<option value="">Select Destination Station</option>';
    
    // Create option groups for each line
    const lines = {
        purpleLine: {
            name: 'Purple Line',
            color: '#9B59B6'
        },
        yellowLine: {
            name: 'Yellow Line',
            color: '#F1C40F'
        },
        redLine: {
            name: 'Red Line',
            color: '#E74C3C'
        }
    };

    // Populate dropdowns with grouped options
    Object.entries(lines).forEach(([lineKey, lineInfo]) => {
        const stations = metroNetwork.stations[lineKey];
        
        // Create option group for each line
        const group = document.createElement('optgroup');
        group.label = lineInfo.name;
        
        stations.forEach(station => {
            const option = document.createElement('option');
            option.value = station.id;
            option.innerHTML = `
                <span class="line-indicator" style="background-color: ${lineInfo.color}"></span>
                ${station.name}
            `;
            option.dataset.line = lineKey;
            group.appendChild(option);
        });
        
        startSelect.appendChild(group.cloneNode(true));
        endSelect.appendChild(group);
    });
});