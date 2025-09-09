document.addEventListener('DOMContentLoaded', (event) => {
    // Get all the necessary elements from the HTML
    const calculateBtn = document.getElementById('calculateBtn');
    const resultsSection = document.getElementById('results-section');
    const etaShipperCapsule = document.getElementById('eta-shipper-capsule');
    const etaShipperDisplay = document.getElementById('eta-shipper-display');
    const ptaShipperDisplay = document.getElementById('pta-shipper-display');
    const etaFinalCapsule = document.getElementById('eta-final-capsule');
    const etaFinalDisplay = document.getElementById('eta-final-display');
    const ptaFinalDisplay = document.getElementById('pta-final-display');
    const etaFinalStatus = document.getElementById('eta-final-status');
    const windowStatus = document.getElementById('window-status');
    const splitSleeperStatus = document.getElementById('split-sleeper-status');

    // Add a click event listener to the Calculate button
    calculateBtn.addEventListener('click', calculateTrip);

    function calculateTrip() {
        // 1. Get user inputs
        const startDateValue = document.getElementById('startDate').value;
        const emptyMiles = parseFloat(document.getElementById('emptyMiles').value) || 0;
        const loadedMiles = parseFloat(document.getElementById('loadedMiles').value) || 0;
        const avgSpeed = parseFloat(document.getElementById('avgSpeed').value) || 50;
        const addBreak = document.getElementById('break').value === 'yes';
        const addReset = document.getElementById('reset').value === 'yes';
        const shipperAppointment = new Date(document.getElementById('shipperAppointment').value);
        const finalAppointment = new Date(document.getElementById('finalAppointment').value);
        const shipperStopType = document.getElementById('stopType').value;
        const finalStopType = document.getElementById('finalStopType').value;
        
        // Input validation
        if (!startDateValue || isNaN(startDateValue)) {
            alert("Please select a valid start date and time.");
            return;
        }
        let ptaCurrent = new Date(startDateValue);

        // 2. Perform the calculations
        // ETA to Shipper (Empty Miles)
        const emptyDriveTimeMinutes = (emptyMiles / avgSpeed) * 60;
        let etaShipper = new Date(ptaCurrent.getTime() + emptyDriveTimeMinutes * 60000);

        // Dwell at Shipper
        let shipperDwellMinutes = 0;
        if (shipperStopType.includes('drop-30')) { shipperDwellMinutes = 30; }
        if (shipperStopType.includes('drop-60')) { shipperDwellMinutes = 60; }
        if (shipperStopType.includes('live-60')) { shipperDwellMinutes = 60; }
        if (shipperStopType.includes('live-120')) { shipperDwellMinutes = 120; }
        
        let ptaAfterShipper = new Date(etaShipper.getTime() + shipperDwellMinutes * 60000);

        // ETA to Final (Loaded Miles)
        const loadedDriveTimeMinutes = (loadedMiles / avgSpeed) * 60;
        let etaFinal = new Date(ptaAfterShipper.getTime() + loadedDriveTimeMinutes * 60000);

        // Dwell at Final
        let finalDwellMinutes = 0;
        if (finalStopType.includes('drop-30')) { finalDwellMinutes = 30; }
        if (finalStopType.includes('drop-60')) { finalDwellMinutes = 60; }
        if (finalStopType.includes('live-60')) { finalDwellMinutes = 60; }
        if (finalStopType.includes('live-120')) { finalDwellMinutes = 120; }
        
        let ptaFinal = new Date(etaFinal.getTime() + finalDwellMinutes * 60000);

        // Add optional driver breaks/resets (these affect the final ETA/PTA)
        const totalDrivingTimeHours = (emptyMiles + loadedMiles) / avgSpeed;
        if (addBreak && totalDrivingTimeHours > 8) {
            etaFinal = new Date(etaFinal.getTime() + 30 * 60000);
            ptaFinal = new Date(ptaFinal.getTime() + 30 * 60000);
        }
        if (addReset && totalDrivingTimeHours > 9) {
            etaFinal = new Date(etaFinal.getTime() + 600 * 60000);
            ptaFinal = new Date(ptaFinal.getTime() + 600 * 60000);
        }
        
        // 3. Update the HTML output
        etaShipperDisplay.textContent = etaShipper.toLocaleString();
        ptaShipperDisplay.textContent = ptaAfterShipper.toLocaleString();
        etaFinalDisplay.textContent = etaFinal.toLocaleString();
        ptaFinalDisplay.textContent = ptaFinal.toLocaleString();

        // 4. Apply status colors and text based on ETA vs. Appointment
        function updateStatus(eta, appointment, capsule) {
            capsule.classList.remove('status-green', 'status-red', 'status-blue', 'status-yellow');
            const timeDifferenceMinutes = (appointment.getTime() - eta.getTime()) / 60000;
            
            if (timeDifferenceMinutes >= 1 && timeDifferenceMinutes <= 59) {
                // ON-TIME: 1 to 59 minutes early
                capsule.classList.add('status-green');
            } else if (timeDifferenceMinutes < 1) {
                // LATE: 1 minute or more after appointment time
                capsule.classList.add('status-red');
            } else if (timeDifferenceMinutes >= 60) {
                // EARLY: 60 minutes or more early
                capsule.classList.add('status-blue');
            }
        }
        
        // Apply status to both Shipper and Final
        updateStatus(etaShipper, shipperAppointment, etaShipperCapsule);
        updateStatus(etaFinal, finalAppointment, etaFinalCapsule);

        // Update the textual status for the final appointment
        const finalTimeDifferenceMinutes = (finalAppointment.getTime() - etaFinal.getTime()) / 60000;
        if (finalTimeDifferenceMinutes >= 1 && finalTimeDifferenceMinutes <= 59) {
            windowStatus.textContent = 'ON-TIME';
        } else if (finalTimeDifferenceMinutes < 1) {
            const lateTime = Math.abs(finalTimeDifferenceMinutes);
            const lateHours = Math.floor(lateTime / 60);
            const lateMinutes = Math.floor(lateTime % 60);
            windowStatus.textContent = `LATE: ${lateHours}h ${lateMinutes}m`;
        } else if (finalTimeDifferenceMinutes >= 60) {
            const earlyTime = finalTimeDifferenceMinutes;
            const earlyHours = Math.floor(earlyTime / 60);
            const earlyMinutes = Math.floor(earlyTime % 60);
            windowStatus.textContent = `EARLY: ${earlyHours}h ${earlyMinutes}m`;
        }
        
        // Split Sleeper check (placeholder)
        splitSleeperStatus.hidden = true;
        
        // HOS rule checks
        const totalDrivingTimeHours = (emptyMiles + loadedMiles) / avgSpeed;
        const driveTimeStatus = totalDrivingTimeHours <= 11 ? 'OK' : 'NOT OK';
        etaFinalStatus.textContent = `11h drive: ${driveTimeStatus}`;
        etaFinalStatus.style.color = driveTimeStatus === 'OK' ? '#48bb78' : '#e53e3e';

        // Display the results section
        resultsSection.removeAttribute('hidden');
    }
});
