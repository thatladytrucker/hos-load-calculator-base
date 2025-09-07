document.addEventListener('DOMContentLoaded', (event) => {
    // Get the Calculate button
    const calculateBtn = document.getElementById('calculateBtn');

    // Add a click event listener to the button
    calculateBtn.addEventListener('click', calculateTrip);

    function calculateTrip() {
        // 1. Get user inputs from the HTML form
        const startDateValue = document.getElementById('startDate').value;
        const emptyMiles = parseFloat(document.getElementById('emptyMiles').value) || 0;
        const loadedMiles = parseFloat(document.getElementById('loadedMiles').value) || 0;
        const avgSpeed = parseFloat(document.getElementById('avgSpeed').value) || 50;
        const addBreak = document.getElementById('break').value === 'yes';
        const addReset = document.getElementById('reset').value === 'yes';

        // Check if a start date is provided
        if (!startDateValue) {
            alert("Please select a start date and time.");
            return;
        }
        const startDate = new Date(startDateValue);

        // 2. Perform the calculations
        const totalMiles = emptyMiles + loadedMiles;
        const totalDriveTimeHours = totalMiles / avgSpeed;

        let totalTripTimeMinutes = totalDriveTimeHours * 60;

        // Add mandatory break
        if (addBreak && totalDriveTimeHours > 8) {
            totalTripTimeMinutes += 30;
        }

        // Add 10-hour reset
        if (addReset && totalDriveTimeHours > 9) {
            totalTripTimeMinutes += 600; // 10 hours * 60 minutes
        }

        // 3. Calculate ETA
        const eta = new Date(startDate.getTime() + totalTripTimeMinutes * 60000);

        // Display the ETA in an alert for now
        alert(`Estimated Time of Arrival (ETA): ${eta.toLocaleString()}`);

        // In the next step, we will build the output display on the screen
        // Instead of an alert, we will update the HTML to show the results.
    }
});
