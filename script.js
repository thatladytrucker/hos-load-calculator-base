document.addEventListener('DOMContentLoaded', (event) => {
    // Get all the necessary elements from the HTML
    const calculateBtn = document.getElementById('calculateBtn');
    const resultsSection = document.getElementById('results-section');
    const etaDisplay = document.getElementById('eta-display');
    const ptaDisplay = document.getElementById('pta-display');
    const etaStatus = document.getElementById('eta-status');
    const windowStatus = document.getElementById('window-status');

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
        const finalAppointment = new Date(document.getElementById('finalAppointment').value);
        const shipperStopType = document.getElementById('stopType').value;
        const finalStopType = document.getElementById('finalStopType').value;
        
        // Input validation
        if (!startDateValue) {
            alert("Please select a valid start date and time.");
            return;
        }
        const startDate = new Date(startDateValue);

        // 2. Perform the calculations
        const totalMiles = emptyMiles + loadedMiles;
        const totalDriveTimeMinutes = (totalMiles / avgSpeed) * 60;

        let totalTripTimeMinutes = totalDriveTimeMinutes;

        // Add stop time based on selection
        let shipperDwellMinutes = 0;
        if (shipperStopType.includes('drop-30')) { shipperDwellMinutes = 30; }
        if (shipperStopType.includes('drop-60')) { shipperDwellMinutes = 60; }
        if (shipperStopType.includes('live-60')) { shipperDwellMinutes = 60; }
        if (shipperStopType.includes('live-120')) { shipperDwellMinutes = 120; }
        totalTripTimeMinutes += shipperDwellMinutes;

        let finalDwellMinutes = 0;
        if (finalStopType.includes('drop-30')) { finalDwellMinutes = 30; }
        if (finalStopType.includes('drop-60')) { finalDwellMinutes = 60; }
        if (finalStopType.includes('live-60')) { finalDwellMinutes = 60; }
        if (finalStopType.includes('live-120')) { finalDwellMinutes = 120; }
        totalTripTimeMinutes += finalDwellMinutes;

        // Add driver options
        const totalDrivingHours = totalDriveTimeMinutes / 60;
        if (addBreak && totalDrivingHours > 8) {
            totalTripTimeMinutes += 30;
        }
        if (addReset && totalDrivingHours > 9) {
            totalTripTimeMinutes += 600; // 10 hours * 60 minutes
        }

        // 3. Calculate ETA and PTA
        const eta = new Date(startDate.getTime() + totalTripTimeMinutes * 60000);
        const pta = new Date(eta.getTime() + finalDwellMinutes * 60000); // PTA is after the final stop's dwell time

        // 4. Update the HTML output
        etaDisplay.textContent = eta.toLocaleString();
        ptaDisplay.textContent = pta.toLocaleString();
        
        // 5. Check status against appointments
        let etaDiff = eta.getTime() - finalAppointment.getTime();
        let etaDiffDays = Math.ceil(etaDiff / (1000 * 60 * 60 * 24));
        
        etaStatus.textContent = '';
        windowStatus.textContent = '';

        if (etaDiffDays > 0) {
            windowStatus.textContent = `Arriving ${Math.abs(etaDiffDays)} day(s) LATE`;
            windowStatus.style.color = '#e53e3e';
        } else if (etaDiffDays < 0) {
            windowStatus.textContent = `Arriving ${Math.abs(etaDiffDays)} day(s) EARLY`;
            windowStatus.style.color = '#4299e1';
        } else {
            windowStatus.textContent = `Arriving On Time`;
            windowStatus.style.color = '#48bb78';
        }
        
        // HOS rule checks
        let driveTimeStatus = totalDrivingHours <= 11 ? 'OK' : 'NOT OK';
        etaStatus.textContent = `11h drive ${driveTimeStatus}`;
        etaStatus.style.color = driveTimeStatus === 'OK' ? '#48bb78' : '#e53e3e';

        resultsSection.removeAttribute('hidden');
    }
});
