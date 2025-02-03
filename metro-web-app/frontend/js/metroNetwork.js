const metroNetwork = {
    stations: {
        purpleLine: [
            { id: 'P1', name: 'An Nassem', coordinates: [24.6892, 46.8253] },
            { id: 'P2', name: 'As Salam', coordinates: [24.6947, 46.8081] },
            { id: 'P3', name: 'Khurais', coordinates: [24.7002, 46.7909] },
            { id: 'P4', name: 'Al Andalus', coordinates: [24.7057, 46.7737] },
            { id: 'P5', name: 'Al Hamra', coordinates: [24.7112, 46.7565], isInterchange: true, connectsWith: ['redLine'] },
            { id: 'P6', name: 'Al Yarmuk', coordinates: [24.7167, 46.7393] },
            { id: 'P7', name: 'Granadia', coordinates: [24.7222, 46.7221] },
            { id: 'P8', name: 'SABIC', coordinates: [24.7277, 46.7049], isInterchange: true, connectsWith: ['yellowLine'] },
            { id: 'P9', name: 'Uthman Bin Affan', coordinates: [24.7332, 46.6877], isInterchange: true, connectsWith: ['yellowLine'] },
            { id: 'P10', name: 'Ar Rabi', coordinates: [24.7387, 46.6705], isInterchange: true, connectsWith: ['yellowLine'] },
            { id: 'P11', name: 'KAFD', coordinates: [24.7442, 46.6533], isInterchange: true, connectsWith: ['yellowLine'] }
        ],
        yellowLine: [
            { id: 'Y1', name: 'Airport T1-2', coordinates: [24.9558, 46.7201] },
            { id: 'Y2', name: 'Airport T3-4', coordinates: [24.9413, 46.7156] },
            { id: 'Y3', name: 'Airport T5', coordinates: [24.9268, 46.7111] },
            { id: 'Y4', name: 'PNU 2', coordinates: [24.8978, 46.7021] },
            { id: 'Y5', name: 'PNU 1', coordinates: [24.8688, 46.6931] },
            { id: 'Y6', name: 'SABIC', coordinates: [24.7277, 46.7049], isInterchange: true, connectsWith: ['purpleLine'] },
            { id: 'Y7', name: 'Uthman Bin Affan', coordinates: [24.7332, 46.6877], isInterchange: true, connectsWith: ['purpleLine'] },
            { id: 'Y8', name: 'Ar Rabi', coordinates: [24.7387, 46.6705], isInterchange: true, connectsWith: ['purpleLine'] },
            { id: 'Y9', name: 'KAFD', coordinates: [24.7442, 46.6533], isInterchange: true, connectsWith: ['purpleLine'] }
        ],
        redLine: [
            { id: 'R1', name: 'King Fahad Sport City', coordinates: [24.7668, 46.8401] },
            { id: 'R2', name: 'Ishbiliyah', coordinates: [24.7556, 46.8167] },
            { id: 'R3', name: 'Al Khalij', coordinates: [24.7334, 46.7866] },
            { id: 'R4', name: 'Al Hamra', coordinates: [24.7112, 46.7565], isInterchange: true, connectsWith: ['purpleLine'] },
            { id: 'R5', name: 'Kalid Bin Alwaleed', coordinates: [24.6890, 46.7264] },
            { id: 'R6', name: 'Riyadh Exhibition Center', coordinates: [24.6668, 46.6963] },
            { id: 'R7', name: 'An Nuzhah', coordinates: [24.6446, 46.6662] }
        ]
    }
};

function calculateTravelTime(startStation, endStation) {
    // Calculate distance between stations using coordinates
    function calculateDistance(coord1, coord2) {
        const R = 6371; // Earth's radius in km
        const lat1 = coord1[0] * Math.PI / 180;
        const lat2 = coord2[0] * Math.PI / 180;
        const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
        const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in km
    }

    // Find station objects
    let start = null;
    let end = null;
    for (const line of Object.values(metroNetwork.stations)) {
        const foundStart = line.find(s => s.id === startStation);
        const foundEnd = line.find(s => s.id === endStation);
        if (foundStart) start = foundStart;
        if (foundEnd) end = foundEnd;
    }

    if (!start || !end) return null;

    // Calculate base travel time
    const distance = calculateDistance(start.coordinates, end.coordinates);
    let travelTime = Math.ceil(distance * 2); // Roughly 2 minutes per km

    // Add transfer time if stations are on different lines
    const startLine = Object.entries(metroNetwork.stations)
        .find(([_, stations]) => stations.some(s => s.id === startStation))?.[0];
    const endLine = Object.entries(metroNetwork.stations)
        .find(([_, stations]) => stations.some(s => s.id === endStation))?.[0];

    if (startLine !== endLine) {
        travelTime += 5; // Add 5 minutes for transfer
    }

    return travelTime;
}
