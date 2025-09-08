document.addEventListener('DOMContentLoaded', (event) => {
    // Get all the necessary elements from the HTML
    const calculateBtn = document.getElementById('calculateBtn');
    const resultsSection = document.getElementById('results-section');
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
        if (!startDateValue) {
            alert("Please select a valid start date and time.");
            return;
        }
        let ptaCurrent = new Date(startDateValue);

        // 2. Leg 0 → Shipper (Empty Miles)
        const emptyDriveTimeMinutes = (emptyMiles / avgSpeed) * 60;
        let etaShipper = new Date(ptaCurrent.getTime() + emptyDriveTimeMinutes * 60000);

        let shipperDwellMinutes = 0;
        if (shipperStopType.includes('drop-30')) { shipperDwellMinutes = 30; }
        if (shipperStopType.includes('drop-60')) { shipperDwellMinutes = 60; }
        if (shipperStopType.includes('live-60')) { shipperDwellMinutes = 60; }
        if (shipperStopType.includes('live-120')) { shipperDwellMinutes = 120; }
        
        let ptaAfterShipper = new Date(etaShipper.getTime() + shipperDwellMinutes * 60000);

        // 3. Final Leg → FINAL (Loaded Miles)
        const loadedDriveTimeMinutes = (loadedMiles / avgSpeed) * 60;
        let etaFinal = new Date(ptaAfterShipper.getTime() + loadedDriveTimeMinutes * 60000);
        
        let finalDwellMinutes = 0;
        if (finalStopType.includes('drop-30')) { finalDwellMinutes = 30; }
        if (finalStopType.includes('drop-60')) { finalDwellMinutes = 60; }
        if (finalStopType.includes('live-60')) { finalDwellMinutes = 60; }
        if (finalStopType.includes('live-120')) { finalDwellMinutes = 120; }
        
        let ptaFinal = new Date(etaFinal.getTime() + finalDwellMinutes * 60000);

        // Add optional driver breaks/resets (these affect the entire trip)
        const totalDrivingTimeHours = (emptyMiles + loadedMiles) / avgSpeed;
        if (addBreak && totalDrivingTimeHours > 8) {
            etaFinal = new Date(etaFinal.getTime() + 30 * 60000);
            ptaFinal = new Date(ptaFinal.getTime() + 30 * 60000);
        }
        if (addReset && totalDrivingTimeHours > 9) {
            etaFinal = new Date(etaFinal.getTime() + 600 * 60000);
            ptaFinal = new Date(ptaFinal.getTime() + 600 * 60000);
        }
        
        // 4. Update the HTML output
        etaShipperDisplay.textContent = etaShipper.toLocaleString();
        ptaShipperDisplay.textContent = ptaAfterShipper.toLocaleString();
        etaFinalDisplay.textContent = etaFinal.toLocaleString();
        ptaFinalDisplay.textContent = ptaFinal.toLocaleString();

        // 5. Apply status colors and text based on ETA vs. Final Appointment
        etaFinalCapsule.classList.remove('status-green', 'status-red', 'status-blue', 'status-yellow'); // Clear existing classes
        windowStatus.textContent = '';
        
        const timeDifferenceMinutes = (finalAppointment.getTime() - etaFinal.getTime()) / 60000;
        
        if (timeDifferenceMinutes >= 0 && timeDifferenceMinutes <= 60) {
            // ON TIME: ETA up to 60 minutes early
            etaFinalCapsule.classList.add('status-green');
            windowStatus.textContent = 'ON-TIME';
        } else if (timeDifferenceMinutes < 0) {
            // LATE: ETA 1 minute or more after appointment time
            etaFinalCapsule.classList.add('status-red');
            const lateTime = Math.abs(timeDifferenceMinutes);
            const lateHours = Math.floor(lateTime / 60);
            const lateMinutes = Math.floor(lateTime % 60);
            windowStatus.textContent = `LATE: ${lateHours}h ${lateMinutes}m`;
        } else if (timeDifferenceMinutes > 60) {
            // EARLY: 61 minutes or more early
            etaFinalCapsule.classList.add('status-blue');
            const earlyTime = timeDifferenceMinutes;
            const earlyHours = Math.floor(earlyTime / 60);
            const earlyMinutes = Math.floor(earlyTime % 60);
            windowStatus.textContent = `EARLY: ${earlyHours}h ${earlyMinutes}m`;
        }
        
        // Split Sleeper check (Pro Version)
        // This is a placeholder for future logic
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
