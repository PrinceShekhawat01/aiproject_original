let i = 0; // Track total water intake
let totalSkipped = 0; // Track total skips
let historyData = []; // Store history for graph

// ✅ Get data received from the URL
let params = new URLSearchParams(window.location.search);
let gender = params.get("gender");
let interval = parseInt(params.get("interval")) || 60;
let intervalTime = interval * 60000; // Convert minutes to milliseconds
let timerId; // Store interval ID

console.log(gender);
console.log(interval);

// ✅ Get references to buttons
const skipBtn = document.getElementById("skip");
const justDrankBtn = document.getElementById("just");
const resetBtn = document.getElementById("reset");

// ✅ Initialize Chart.js Pie Chart
let ctx = document.getElementById("historyGraph").getContext("2d");
let historyChart = new Chart(ctx, {
    type: "pie",
    data: {
        labels: ["Drunk Water", "Skipped"],
        datasets: [
            {
                label: "Water Intake & Skips",
                data: [0, 0],
                backgroundColor: ["rgba(54, 162, 235, 0.8)", "rgba(255, 99, 132, 0.8)"],
                borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
                borderWidth: 1,
            },
        ],
    },
    options: {
        responsive: false,
        maintainAspectRatio: false,
    },
});

// ✅ Register Service Worker for Push Notifications
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
            console.log("Service Worker registration failed:", error);
        });
}

// ✅ Request Notification Permission
if (Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            console.log("Notification permission granted.");
        } else {
            console.log("Notification permission denied.");
        }
    });
}

// ✅ Timer for Male
function timermen() {
    const currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + interval);
    const nextTime = currentDate.toLocaleTimeString();

    // Update reminder time
    document.getElementById("time").innerHTML = `Next Reminder: ${nextTime}`;

    // 💧 Update water status
    updateStatus();
    checkGoal();
}

// ✅ Timer for Female
function timerfemale() {
    const currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + interval);
    const nextTime = currentDate.toLocaleTimeString();

    // Update reminder time
    document.getElementById("time").innerHTML = `Next Reminder: ${nextTime}`;

    // 💧 Update water status
    updateStatus();
    checkGoal();
}

// ✅ Add Current Time to History
function addToHistory(date, type = "Drink", amount = 0) {
    let d = document.getElementById("history");
    let innerd = document.createElement("div");
    innerd.className = "status";

    let h1 = document.createElement("span");
    let h2 = document.createElement("span");
    h1.style.width = "fit-content";
    h2.style.width = "fit-content";

    // Format time for history
    const historyTime = date.toLocaleTimeString();
    let history = document.createTextNode(`${type} at ${historyTime} - ${amount} ml`);
    let img = document.createElement("img");
    img.src = "done.png"; // Add your done icon here
    img.width = 20;
    img.height = 20;

    // Append elements to history
    h1.append(history);
    h2.append(img);
    innerd.append(h1);
    innerd.append(h2);
    d.append(innerd);

    // ✅ Add to graph data
    if (type === "Skip") {
        totalSkipped += 1;
    } else {
        historyData.push({
            time: historyTime,
            intake: amount,
            type: type,
        });
    }
    updateGraph();
}

// ✅ Update Graph with Correct Data
function updateGraph() {
    let totalIntake = historyData.reduce((acc, entry) => acc + entry.intake, 0);
    historyChart.data.datasets[0].data = [totalIntake, totalSkipped];
    historyChart.update();
}

// ⏩ Skip Button - Add 20 Minutes & Reset Timer
function skip() {
    const currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + interval * 2);
    const nextTime = currentDate.toLocaleTimeString();

    document.getElementById("time").innerHTML = `Next Reminder: ${nextTime}`;

    // ✅ Show Alert for Skipped
    //alert("⏩ Reminder skipped! Next reminder in 20 mins.");

    // Add skip event to history and graph
    addToHistory(currentDate, "Skip", 0);

    clearInterval(timerId);
    timerId = setTimeout(() => {
        sendNotification("💧 Time to drink water!");
        addToHistory(new Date(), "Drink Water Reminder", 0);
        updateWaterIntake(250);
        resetInterval(intervalTime);
    }, 1200000); // 20 minutes
}

// ✅ Just Drank Button - Add Time to History
function justDrank() {
    const currentDate = new Date();
    let amount = 250;

    addToHistory(currentDate, "Drink", amount);

    // 💧 Update water intake correctly based on gender
    updateWaterIntake(amount);

    // ✅ Show Alert for Just Drank
    //alert("💧 Great! Water intake added successfully.");

    resetInterval(intervalTime);
}

// ✅ Update Water Intake and Check Goal
function updateWaterIntake(amount) {
    if (gender === "male" && i < 3170) {
        i += amount; // Increase 250 ml for male
    } else if (gender === "female" && i < 2170) {
        i += amount; // Increase 250 ml for female
    }
    updateStatus();
    checkGoal();
}

// ✅ Update Status Based on Intake
function updateStatus() {
    if (gender === "male") {
        document.getElementById("status01").innerHTML = `${i}/3170 ml completed`;
    } else {
        document.getElementById("status01").innerHTML = `${i}/2170 ml completed`;
    }
}

// ✅ Check if Goal is Reached
function checkGoal() {
    if ((gender === "male" && i >= 3170) || (gender === "female" && i >= 2170)) {
        document.getElementById("status01").innerHTML = `✅ Aaj ka ho gaya bhai!`;
        document.getElementById("status01").style.color = "red";
        clearInterval(timerId);

        // 🚫 Disable Buttons After Goal Reached
        justDrankBtn.style.display = "none";
        skipBtn.style.display = "none";

        // 🔄 Show Reset Button
        resetBtn.style.display = "block";
    }
}

// 🔄 Reset Button - Restart the App
function resetApp() {
    i = 0;
    totalSkipped = 0;
    historyData = [];
    document.getElementById("status01").innerHTML = `0/${gender === "male" ? 3170 : 2170} ml completed`;
    document.getElementById("status01").style.color = "black";
    document.getElementById("history").innerHTML = ""; // Clear history

    // ✅ Enable Buttons and Hide Reset Button
    justDrankBtn.style.display = "";
        skipBtn.style.display = "";
    resetBtn.style.display = "none";

    updateGraph(); // Reset graph

    // Restart based on gender
    if (gender === "male") {
        timermen();
    } else {
        timerfemale();
    }

    // Restart timer
    resetInterval(intervalTime);
}

// ⏰ Reset Reminder Interval
function resetInterval(time) {
    clearInterval(timerId);
    timerId = setInterval(() => {
        sendNotification("💧 Time to drink water!");
        addToHistory(new Date(), "Drink Water Reminder", 0);
        updateWaterIntake(250);
        if (gender === "male") {
            timermen();
        } else {
            timerfemale();
        }
    }, time);
}

// ✅ Send Push Notification
function sendNotification(message) {
    if ("serviceWorker" in navigator && "PushManager" in window) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification("💧 Water Reminder", {
                body: message,
                icon: "done.png",
                vibrate: [200, 100, 200],
            });
        });
    }
}

// ✅ Initialize Based on Gender
window.onload = function () {
    if (gender === "male") {
        timermen();
    } else if (gender === "female") {
        timerfemale();
    }

    timerId = setInterval(() => {
        sendNotification("💧 Time to drink water!");
        addToHistory(new Date(), "Reminder", 250);
        updateWaterIntake(250);
        if (gender === "male") {
            timermen();
        } else {
            timerfemale();
        }
    }, intervalTime);
};

// ⏩ Add Event Listeners for Buttons
skipBtn.addEventListener("click", skip);
justDrankBtn.addEventListener("click", justDrank);
resetBtn.addEventListener("click", resetApp);
