// Function to upload file
function uploadFile(inputId) {
    document.getElementById(inputId).click();
}

// Function to handle file upload
function handleFileUpload(fileInput, fileInputLabelId) {
    var file = fileInput.files[0];
    if (!file) return; // No file selected

    // Validate file format (e.g., allow only .xlsx files)
    if (!file.name.endsWith('.xlsx')) {
        alert("Please upload a valid .xlsx file.");
        fileInput.value = ''; // Clear the file input
        document.getElementById(fileInputLabelId).textContent = ''; // Clear the file label
        return;
    }

    document.getElementById(fileInputLabelId).textContent = "File: " + file.name;
}

// Function to remove call data file
function removeCallData() {
    var callDataInput = document.getElementById('callDataInput');
    callDataInput.value = '';
    handleFileUpload(callDataInput, 'callDataFileLabel');
}

// Function to remove sales data file
function removeSalesData() {
    var salesDataInput = document.getElementById('salesDataInput');
    salesDataInput.value = '';
    handleFileUpload(salesDataInput, 'salesDataFileLabel');
}

// Function to display a notification popup
function displayNotification(message) {
    var notification = document.getElementById("notification");
    notification.textContent = message;
    notification.style.display = "block";
    setTimeout(function() {
        notification.style.display = "none";
    }, 3000); // Remove notification after 3 seconds
}

// Function to upload a file
function uploadFile(inputId) {
    document.getElementById(inputId).click();
}

// Function to remove call data input
function removeCallData() {
    document.getElementById('callDataInput').value = '';
    document.getElementById("callDataFileLabel").textContent = '';
}

// Function to remove sales data input
function removeSalesData() {
    document.getElementById('salesDataInput').value = '';
    document.getElementById("salesDataFileLabel").textContent = '';
}

// Function to read an Excel file
function readExcelFile(file) {
    return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' });
            var jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
            resolve(jsonData);
        };
        reader.onerror = function(error) {
            reject(error);
        };
        reader.readAsArrayBuffer(file);
    });
}

// Function to display data in the output div
function displayData(data, dataType) {
    var outputDiv = document.getElementById('output');
    var heading = document.createElement("h2");
    heading.textContent = "Data Uploaded Successfully - " + dataType;
    outputDiv.appendChild(heading);

    var table = "<table><tr>";
    Object.keys(data[0]).forEach(function(key) {
        table += "<th>" + key + "</th>";
    });
    table += "</tr>";
    data.forEach(function(row) {
        table += "<tr>";
        Object.values(row).forEach(function(value) {
            table += "<td>" + value + "</td>";
        });
        table += "</tr>";
    });
    table += "</table>";
    outputDiv.innerHTML += table;
}

// Function to export data to Excel
function exportData(data, filename) {
    var ws = XLSX.utils.json_to_sheet(data);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, filename + ".xlsx");
}

// Function to display sample data
function displaySampleData() {
    document.getElementById('output').innerHTML = '';
    
    var callData = [
        { "Caller No": "1234567890", "Call Date": "2024-04-23", "Start Time": "09:00:00" },
        { "Caller No": "0987654321", "Call Date": "2024-04-24", "Start Time": "10:30:00" },
        { "Caller No": "5555555555", "Call Date": "2024-04-25", "Start Time": "12:45:00" }
    ];

    var salesData = [
        { "Sale Order Item Code": "1001", "Caller No": "1234567890", "Call Date": "2024-04-23", "Start Time": "08:45:00" },
        { "Sale Order Item Code": "1002", "Caller No": "5555555555", "Call Date": "2024-04-25", "Start Time": "11:00:00" }
    ];

    displayData(callData, "Sample Call Data");
    displayData(salesData, "Sample Sales Data");

    var exportButton = document.createElement("button");
    exportButton.textContent = "Export Sample Data";
    exportButton.onclick = function() {
        exportData(callData, "Sample_Call_Data");
        exportData(salesData, "Sample_Sales_Data");
    };
    document.getElementById("output").appendChild(exportButton);

    displayNotification("Sample data displayed successfully.");
}

// Function to display uploaded data
function displayUploadedData() {
    document.getElementById('output').innerHTML = '';
    
    var callDataFile = document.getElementById('callDataInput').files[0];
    var salesDataFile = document.getElementById('salesDataInput').files[0];

    if (!callDataFile || !salesDataFile) {
        alert("Please select both call data and sales data files.");
        return;
    }

    document.getElementById("callDataFileLabel").textContent = "Call Data File: " + callDataFile.name;
    document.getElementById("salesDataFileLabel").textContent = "Sales Data File: " + salesDataFile.name;

    Promise.all([readExcelFile(callDataFile), readExcelFile(salesDataFile)])
        .then(function(filesData) {
            var callData = filesData[0];
            var salesData = filesData[1];

            displayData(callData, "Call Data");
            displayData(salesData, "Sales Data");
        })
        .catch(function(error) {
            console.error("Error reading files:", error);
            alert("Error reading files. Please try again.");
        });

    displayNotification("Uploaded data displayed successfully.");
}

// Function to process data
function processData() {
    document.getElementById('output').innerHTML = '';
    
    var callDataFile = document.getElementById('callDataInput').files[0];
    var salesDataFile = document.getElementById('salesDataInput').files[0];

    if (!callDataFile || !salesDataFile) {
        alert("Please select both call data and sales data files.");
        return;
    }

    Promise.all([readExcelFile(callDataFile), readExcelFile(salesDataFile)])
        .then(function(filesData) {
            var callData = filesData[0];
            var salesData = filesData[1];

            // Sort and remove duplicates from call data
            callData = removeDuplicates(callData);

            // Process data and export final data
            var finalData = processDataAndExport(callData, salesData);
            displayData(finalData, "Processed Data");

            // Create and append Export Processed Data button
            var exportButton = document.createElement("button");
            exportButton.textContent = "Export Processed Data";
            exportButton.onclick = function() {
                exportData(finalData, "processed_data");
            };
            document.getElementById("output").appendChild(exportButton);
        })
        .catch(function(error) {
            console.error("Error reading files:", error);
            alert("Error reading files. Please try again.");
        });

    displayNotification("Data processed successfully.");
}

// Function to remove duplicates from data
function removeDuplicates(data) {
    var uniqueData = [];
    var uniqueMap = new Map();
    data.forEach(function(row) {
        var key = row["Caller No"] + row["Call Date"];
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, true);
            uniqueData.push(row);
        }
    });
    return uniqueData;
}

// Function to process and export data
function processDataAndExport(callData, salesData) {
    var finalData = [];
    salesData.forEach(function(sale) {
        var matchingCalls = callData.filter(function(call) {
            return call["Caller No"] === sale["Caller No"];
        });
        matchingCalls.forEach(function(call) {
            if (call["Call Date"] < sale["Call Date"] || 
                (call["Call Date"] === sale["Call Date"] && call["Start Time"] < sale["Start Time"])) {
                finalData.push({
                    "Sale Order Item Code": sale["Sale Order Item Code"],
                    "Caller No": sale["Caller No"],
                    "Call Date": call["Call Date"],
                    "Start Time": call["Start Time"]
                });
            }
        });
    });
    return finalData;
}

// Function to export processed data
function exportProcessedData() {
    var processedData = document.getElementById('output').innerText;
    if (!processedData) {
        alert("No processed data to export.");
        return;
    }
    var blob = new Blob([processedData], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "processed_data.txt");
    displayNotification("Processed data exported successfully.");
}
