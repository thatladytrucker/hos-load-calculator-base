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
        const shipperAppointment = new Date(document.getElementById('shipperAppointment').value);
        const finalAppointment = new Date(document.getElementById('finalAppointment').value);
        const shipperStopType = document.getElementById('stopType').value;
        const finalStopType = document.getElementById('finalStopType').value;
        
        // Input validation
        if (!startDateValue) {
            alert("Please select a start date and time.");
            return;
        }
        const startDate = new Date(startDateValue);

        // 2. Perform calculations
        const totalMiles = emptyMiles + loadedMiles;
        const totalDriveTimeHours = totalMiles / avgSpeed;

        let totalTripTimeMinutes = totalDriveTimeHours * 60;

        // Add stop time based on selection
        let shipperStopTime = 0;
        let finalStopTime = 0;
        
        if (shipperStopType.includes('drop')) {
            shipperStopTime = shipperStopType.split('-')[1];
        } else if (shipperStopType.includes('live')) {
            shipperStopTime = shipperStopType.split('-')[1];
        }

        if (finalStopType.includes('drop')) {
            finalStopTime = finalStopType.split('-')[1];
        } else if (finalStopType.includes('live')) {
            finalStopTime = finalStopType.split('-')[1];
        }

        totalTripTimeMinutes += parseFloat(shipperStopTime);
        totalTripTimeMinutes += parseFloat(finalStopTime);

        // Add driver options
        if (addBreak && totalDriveTimeHours > 8) {
            totalTripTimeMinutes += 30;
        }
        if (addReset && totalDriveTimeHours > 9) {
            totalTripTimeMinutes += 600; // 10 hours * 60 minutes
        }

        // 3. Calculate ETA and PTA
        const eta = new Date(startDate.getTime() + totalTripTimeMinutes * 60000);
        const pta = new Date(eta.getTime() + 60 * 60000); // PTA is 1 hour after ETA for simplicity

        // 4. Update the HTML output
        etaDisplay.textContent = eta.toLocaleString();
        ptaDisplay.textContent = pta.toLocaleString();
        
        // 5. Check status against appointments
        let etaDiff = eta.getTime() - finalAppointment.getTime();
        let etaDiffDays = Math.ceil(etaDiff / (1000 * 60 * 60 * 24));
        
        // Reset status text
        etaStatus.textContent = '';
        windowStatus.textContent = '';

        if (etaDiffDays > 0) {
            windowStatus.textContent = `Arriving ${Math.abs(etaDiffDays)} day(s) LATE`;
            windowStatus.style.color = '#e53e3e'; // Red
        } else if (etaDiffDays < 0) {
            windowStatus.textContent = `Arriving ${Math.abs(etaDiffDays)} day(s) EARLY`;
            windowStatus.style.color = '#4299e1'; // Blue
        } else {
            windowStatus.textContent = `Arriving On Time`;
            windowStatus.style.color = '#48bb78'; // Green
        }
        
        // HOS rule checks
        let driveTimeStatus = totalDriveTimeHours <= 11 ? 'OK' : 'NOT OK';
        etaStatus.textContent = `11h drive ${driveTimeStatus}`;
        etaStatus.style.color = driveTimeStatus === 'OK' ? '#48bb78' : '#e53e3e';

        // Display the results section
        resultsSection.removeAttribute('hidden');
    }
});
