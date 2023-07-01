// Preloader
window.addEventListener('load', function () {
    var preloader = document.querySelector('#preloader');
    if (preloader) {
        preloader.style.opacity = 0;
        setTimeout(function () {
            preloader.parentNode.removeChild(preloader);
        }, 500);
    }
});

let activePage = "employeePage";

// Show and hide pages -------------------------------------------------------------

function resetPages() {
    ["employeePage", "departmentsPage", "locationsPage"].forEach(function (id) {
        document.getElementById(id).style.display = "none";
    });
    document.getElementById('allSearch').value = "";
}

function showPage(pageId, getDataFunc) {
    resetPages();
    getDataFunc();
    document.getElementById(pageId).style.display = "block";
}


function showEverything() {
    showPage("employeePage", getEmployees);
    showPage("departmentsPage", getDepartments);
}

function showAllDepartments() {
    showPage("departmentsPage", getDepartments);
}

function showAllLocations() {
    showPage("locationsPage", getLocations);
}

// Tab buttons: 

// Add an event listener to each button to handle the click event
document.getElementById("navEmployees").addEventListener("click", function () {
    if (activePage !== "employeePage") {
        activePage = "employeePage";
        showPage(activePage, getEmployees);
        selectButton("navEmployees"); // Highlight the active page button
    }
});

document.getElementById("navDepartments").addEventListener("click", function () {
    if (activePage !== "departmentsPage") {
        activePage = "departmentsPage";
        showPage(activePage, getDepartments);
        selectButton("navDepartments"); // Highlight the active page button
    }
});

document.getElementById("navLocations").addEventListener("click", function () {
    if (activePage !== "locationsPage") {
        activePage = "locationsPage";
        showPage(activePage, getLocations);
        selectButton("navLocations"); // Highlight the active page button
    }
});

// Function to select the button and update the active class
function selectButton(buttonId) {
    // Remove the active class from all buttons
    var buttons = document.getElementsByClassName("btn");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("active");
    }

    // Add the active class to the selected button
    var selectedButton = document.getElementById(buttonId);
    selectedButton.classList.add("active");
}

// Add button --------------------------------------------------------------------

// Add button event listener
document.getElementById('addButton').addEventListener('click', function (event) {
    event.preventDefault();

    var activePageButtonId = '';
    var modalId = '';

    // Determine the active page button ID and modal ID based on the active page
    switch (activePage) {
        case 'employeePage':
            activePageButtonId = 'navEmployees';
            modalId = '#createEmployeeModal';
            getDepartmentList(); // Populate department dropdown
            break;
        case 'departmentsPage':
            activePageButtonId = 'navDepartments';
            modalId = '#createDepartmentModal';
            getLocationsList(); // Populate locations dropdown
            break;
        case 'locationsPage':
            activePageButtonId = 'navLocations';
            modalId = '#createLocationModal';
            break;
        default:
            // No specific action for other pages
            break;
    }

    // Set the data-id attribute of the button
    this.setAttribute('data-id', activePageButtonId);

    // Open the corresponding modal
    $(modalId).modal('show');
});

// Show pages ----------------------------------------------------------------------

// Show pages ----------------------------------------------------------------------

function showAllDepartments() {
    showPage("departmentsPage", getDepartments);
}

document.getElementById("navEmployees").addEventListener("click", function () {
    if (activePage !== "employeePage") {
        activePage = "employeePage";
        showPage(activePage, getEmployees);
        selectButton("navEmployees"); // Highlight the active page button
    }
});

// Remove the duplicate event listener for "navDepartments" button
document.getElementById("navDepartments").removeEventListener("click", showAllDepartments);

document.getElementById("navDepartments").addEventListener("click", function () {
    if (activePage !== "departmentsPage") {
        activePage = "departmentsPage";
        showPage(activePage, getDepartments);
        selectButton("navDepartments"); // Highlight the active page button
    }
});

document.getElementById("navLocations").addEventListener("click", function () {
    if (activePage !== "locationsPage") {
        activePage = "locationsPage";
        showPage(activePage, getLocations);
        selectButton("navLocations"); // Highlight the active page button
    }
});




// Create update delete  employees -------------------------------------------------

$(".deleteEmployee").on('click', function () {
    let confirmationOptions = {
        icon: "warning",
        buttons: {
            cancel: "No",
            confirm: {
                text: "Yes",
                value: "confirm"
            },
        },
    };

    let message = `Are you sure you want to remove ${currentEmployeeName}?`;

    sweetAlert(message, confirmationOptions)
        .then((userChoice) => {
            if (userChoice === "confirm") {
                deleteEmployee(currentEmpID, currentEmployeeName);
            }
        });
});



document.getElementById('formEmployee').addEventListener('submit', function (e) {
    e.preventDefault();
    createEmployee();
    showEverything();
    this.reset();
    $("#createEmployeeModal").modal("hide");
});



document.getElementById('employeeEditForm').addEventListener('submit', function (e) {
    e.preventDefault();
    updateEmployee();
    $("#employeeProfileEditModal").modal("hide");
});


// Create new department -----------------------------------------------------------


document.getElementById('formDepartment').addEventListener('submit', function (e) {
    e.preventDefault();
    createDepartment();
    this.reset();
    $('#createDepartmentModal').modal('hide');
});



document.getElementById('departmentSaveButton').addEventListener('click', function () {
    updateDepartment();
    $('#departmentEditModal').modal('hide');
});

document.getElementById('departmentCancelButton').addEventListener('click', showAllDepartments);



// Create new location -------------------------------------------------------------


$("#formLocation").submit(function (e) {
    e.preventDefault();
    createLocation();
    document.getElementById("formLocation").reset();
    $("#createLocationModal").modal("hide")
});

$("#locationsEditForm").submit(function (e) {
    e.preventDefault();
    updateLocation();
    $("#locationEditModal").modal("hide")
});

$("#locationCancelButton").click(function () {
    showLocations();
});

// Search bar for all employees ----------------------------------------------------

$("#allSearchBar").submit(function (e) {
    e.preventDefault();
    searchAll();

});

$("#allSearch").keyup(function () {
    searchAll();
})


$(".backToAllButton").click(function () {
    showEverything();
});

$(".backToDepartmentsButton").click(function () {
    showAllDepartments();
});

$(".backToLocationsButton").click(function () {
    showLocations();
});

// Variables -----------------------------------------------------------------------

let currentEmpID;
let allEmployees;
let allDepartments;
let allLocations;
let currentDepartmentID;
let currentDepartmentFilter = null;
let currentLocationID;
let currentLocationFilter = null;
let currentEmployeeName;

// Show employees on load ----------------------------------------------------------

getDepartments();
getEmployees();
getLocations();

function searchAll() {
    getEmployees();
    getDepartments();
    getLocations();

    document.getElementById("employeePage").style.display = "block";
    document.getElementById("departmentsPage").style.display = "block";
    document.getElementById("locationsPage").style.display = "block";
}

// 
function getEmployees() {
    $.ajax({
        url: 'libs/php/getAll.php',
        type: 'GET',
        dataType: 'json',
        data: {},
        success: function (result) {

            document.getElementById("employeeList").innerHTML = "";

            allEmployees = result.data;

            currentDepartmentFilter = null;

            showAllEmployees();
        }
    })
};

// Get list of all employees, name, department  on load + sort on search -----------

function showAllEmployees() {
    const employeeList = document.getElementById("employeeList");
    employeeList.innerHTML = "";

    for (const employee of allEmployees) {
        if (shouldShowEmployee(employee)) {
            const div = document.getElementById("employeeEntry");
            const clonedDiv = div.cloneNode(true);
            employeeList.appendChild(clonedDiv);

            clonedDiv.getElementsByClassName("listName")[0].innerText = `${employee.firstName} ${employee.lastName}`;
            clonedDiv.getElementsByClassName("listJob")[0].innerText = employee.jobTitle;
            clonedDiv.getElementsByClassName("listDepartment")[0].innerText = employee.department;

            document.getElementById("employeePage").style.display = "block";

            clonedDiv.setAttribute("id", `emp${employee.id}`);

            // Read the current id from the row and fill the pop-up --------------------
            clonedDiv.addEventListener("click", function () {
                const id = this.closest("[id]").getAttribute("id").replace("emp", "");
                fillEmployeeProfile(id);
                $("#employeeProfileModal").modal("show");
            });

            // Read the current ID from the row id and fill in the form ----------------
            clonedDiv.getElementsByClassName("employeeEditButton")[0].addEventListener("click", function (e) {
                const id = this.closest("[id]").getAttribute("id").replace("emp", "");
                fillEmployeeProfile(id);
                $("#employeeProfileEditModal").modal("show");
                e.stopPropagation();
            });

            // Read the current ID from the row id and check to see if you can delete it
            clonedDiv.getElementsByClassName("employeeDeleteButton")[0].addEventListener("click", function (e) {
                const id = this.closest("[id]").getAttribute("id").replace("emp", "");
                const employeeName = this.closest("tr").querySelector(".listName").innerText;

                sweetAlert(`Are you sure you want to remove ${employeeName}?`, {
                    icon: "warning",
                    buttons: {
                        cancel: "No",
                        confirm: {
                            text: "Yes",
                            value: "confirm"
                        },
                    },
                })
                    .then((value) => {
                        switch (value) {
                            case "confirm":
                                deleteEmployee(id, employeeName);
                                break;
                        }
                    });
                e.stopPropagation();
            });
        }
    }
}




// Show all employees in a department ----------------------------------------------

function shouldShowEmployee(employee) {
    const search = document.getElementById("allSearch").value.toLowerCase();

    return (
        employee.firstName.toLowerCase().includes(search) ||
        employee.lastName.toLowerCase().includes(search) ||
        employee.department.toLowerCase().includes(search) ||
        employee.location.toLowerCase().includes(search) ||
        employee.email.toLowerCase().includes(search) ||
        employee.jobTitle.toLowerCase().includes(search)
    );
}



// Show the list of departments ----------------------------------------------------

function getDepartments() {
    $.ajax({
        url: 'libs/php/getAllDepartments.php',
        type: 'GET',
        dataType: 'json',
        data: {},
        success: function (result) {
            const departmentsList = document.getElementById("departmentsList");
            departmentsList.innerHTML = "";

            allDepartments = result.data;
            currentLocationFilter = null;

            showDepartments();
        }
    });
}

function showDepartments() {
    const departmentsList = document.getElementById("departmentsList");
    departmentsList.innerHTML = "";

    for (const department of allDepartments) {
        if (shouldShowDepartment(department)) {
            const div = document.getElementById("departmentsEntry");
            const clonedDiv = div.cloneNode(true);
            departmentsList.appendChild(clonedDiv);

            clonedDiv.getElementsByClassName("departmentsName")[0].innerText = department.name;
            clonedDiv.getElementsByClassName("locationName")[0].innerText = department.location;
            clonedDiv.getElementsByClassName("numOfEmployees")[0].innerText = department.num_of_employees;
            clonedDiv.getElementsByClassName("locationID")[0].innerText = department.locationID;

            clonedDiv.setAttribute("id", `dep${department.id}`);
        }
    }

    const departmentEditButtons = document.getElementsByClassName("departmentEditButton");
    for (const button of departmentEditButtons) {
        button.addEventListener("click", function () {
            const id = this.closest("[id]").getAttribute("id").replace("dep", "");
            const departmentName = this.closest("tr").querySelector(".departmentsName").innerText;
            const locationID = this.closest("tr").querySelector(".locationID").innerText;

            currentDepartmentID = id;

            document.getElementById("departmentNameEdit").value = departmentName;
            document.getElementById("departmentEditHeader").innerText = `Editing ${departmentName}`;

            getLocationsListEdit(locationID);
        });
    }

    const departmentDeleteButtons = document.getElementsByClassName("departmentDeleteButton");
    for (const button of departmentDeleteButtons) {
        button.addEventListener("click", function () {
            const id = this.closest("[id]").getAttribute("id").replace("dep", "");
            const departmentName = this.closest("tr").querySelector(".departmentsName").innerText;
            const numOfEmployees = this.closest("tr").querySelector(".numOfEmployees").innerText;

            if (parseInt(numOfEmployees) > 0) {
                sweetAlert(`There are ${numOfEmployees} employees in ${departmentName}. You cannot delete it.`, {
                    icon: "error",
                });
            } else {
                sweetAlert(`Are you sure you want to delete ${departmentName}?`, {
                    icon: "warning",
                    buttons: {
                        cancel: "No",
                        confirm: {
                            text: "Yes",
                            value: "confirm"
                        },
                    },
                })
                    .then((value) => {
                        switch (value) {
                            case "confirm":
                                deleteDepartment(id, departmentName);
                                break;
                        }
                    });
            }
        });
    }

}

function shouldShowDepartment(department) {
    const search = document.getElementById("allSearch").value.toLowerCase();

    return (
        department.name.toLowerCase().includes(search) ||
        department.location.toLowerCase().includes(search)
    );
}



// Show the list of locations -----------------------------------------------------

function getLocations() {
    $.ajax({
        url: 'libs/php/getAllLocations.php',
        type: 'GET',
        dataType: 'json',
        data: {},
        success: function (result) {
            const locationsList = document.getElementById("locationsList");
            locationsList.innerHTML = "";

            allLocations = result.data;
            currentLocationFilter = null;

            showLocations();
        }
    });
}

function showLocations() {
    const locationsList = document.getElementById("locationsList");
    locationsList.innerHTML = "";

    for (const location of allLocations) {
        if (shouldShowLocation(location)) {
            const div = document.getElementById("locationsEntry");
            const clonedDiv = div.cloneNode(true);
            locationsList.appendChild(clonedDiv);

            clonedDiv.getElementsByClassName("locationsName")[0].innerText = location.name;
            clonedDiv.getElementsByClassName("numOfDepts")[0].innerText = location.num_of_depts;

            clonedDiv.setAttribute("id", `loc${location.id}`);
        }
    }

    const locationEditButtons = document.getElementsByClassName("locationEditButton");
    for (const button of locationEditButtons) {
        button.addEventListener("click", function () {
            const id = this.closest("[id]").getAttribute("id").replace("loc", "");
            const locationName = this.closest("tr").querySelector(".locationsName").innerText;

            currentLocationID = id;

            document.getElementById("locationNameEdit").value = locationName;
            document.getElementById("locationEditHeader").innerText = `Editing ${locationName}`;
        });
    }

    const locationDeleteButtons = document.getElementsByClassName("locationDeleteButton");
    for (const button of locationDeleteButtons) {
        button.addEventListener("click", function () {
            const id = this.closest("[id]").getAttribute("id").replace("loc", "");
            const locationName = this.closest("tr").querySelector(".locationsName").innerText;
            const numOfDepts = this.closest("tr").querySelector(".numOfDepts").innerText;

            if (parseInt(numOfDepts) > 0) {
                sweetAlert(`You cannot delete ${locationName}. There are still departments in the location.`, {
                    icon: "error",
                });
            } else {
                sweetAlert(`Are you sure you want to delete ${locationName}?`, {
                    icon: "warning",
                    buttons: {
                        cancel: "No",
                        confirm: {
                            text: "Yes",
                            value: "confirm"
                        },
                    },
                })
                    .then((value) => {
                        switch (value) {
                            case "confirm":
                                deleteLocation(id, locationName);
                                break;
                        }
                    });
            }
        });
    }
}

function shouldShowLocation(location) {
    const search = document.getElementById("allSearch").value.toLowerCase();

    return location.name.toLowerCase().includes(search);
}


// Show employee profile -----------------------------------------------------------



$(document).on('click', '.employeeEditButton', function () {
    var employeeId = $(this).data('id');
    fillEmployeeProfile(employeeId);
});

$('#employeeProfileEditModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Get the button that triggered the modal
    var employeeId = button.data('id');


});

function fillEmployeeProfile(employeeId) {
    // Retrieve employee data using AJAX request
    $.ajax({
        url: 'libs/php/getPersonnelByID.php',
        type: 'GET',
        dataType: 'json',
        data: {
            id: employeeId,
        },
        success: function (result) {
            const personnel = result.data.personnel[0];

            $('#employeeID').val(personnel.id);

            // Update the employee profile fields with retrieved data
            $('#employeeName').text(`${personnel.firstName} ${personnel.lastName}`);
            $('#employeeLocation').text(personnel.location);
            $('#employeeEmail').text(personnel.email);
            $('#employeeDepartment').text(personnel.department);
            $('#employeeLocation').text(personnel.location);
            $('#employeeJobTitle').text(personnel.jobTitle);

            // Set the input fields in the edit form with retrieved data
            $('#employeeFirstNameEdit').val(personnel.firstName);
            $('#employeeLastNameEdit').val(personnel.lastName);
            $('#employeeEmailEdit').val(personnel.email);
            $('#employeeJobTitleEdit').val(personnel.jobTitle);

            // Set the modal title with the employee's name
            $('#employeeNameEdit').text(`Editing ${personnel.firstName} ${personnel.lastName}`);

            // Store the current employee's name and ID (if needed)
            currentEmployeeName = `${personnel.firstName} ${personnel.lastName}`;
            currentEmpID = personnel.id;

            // Call a function to get the department list for editing (if needed)
            getDepartmentListEdit(personnel.departmentID);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Handle error if the AJAX request fails
            console.error(errorThrown);
        },
    });
}

$('#employeeProfileEditModal').on('shown.bs.modal', function () {
    // Set focus on the first name field
    $('#employeeFirstNameEdit').focus();
});



// Delete employee from database ---------------------------------------------------

function deleteEmployee(employeeID, employeeName) {
    $.ajax({
        url: 'libs/php/deletePersonnelByID.php',
        type: 'POST',
        dataType: 'json',
        data: {
            id: employeeID,
        },
        success: function (result) {
            if (result.status.name === "ok") {
                sweetAlert(`You have successfully removed ${employeeName}.`, {
                    icon: "success",
                }).then(() => {
                    showEverything();
                    $("#employeeProfileModal").modal("hide");
                });
            } else {
                sweetAlert("Something has gone wrong. Please try again.", {
                    icon: "error",
                });
                showEverything();
            }
        },
    });
}


// Create new employee -------------------------------------------------------------

function createEmployee() {
    const firstName = document.getElementById("formFirstName").value;
    const lastName = document.getElementById("formLastName").value;
    const jobTitle = document.getElementById("formJobTitle").value;
    const email = document.getElementById("formEmail").value;
    const departmentID = document.getElementById("formDepartmentDropdown").value;

    $.ajax({
        url: 'libs/php/insertPersonnel.php',
        type: 'POST',
        dataType: 'json',
        data: {
            firstName: firstName,
            lastName: lastName,
            jobTitle: jobTitle,
            email: email,
            departmentID: departmentID,
        },
        success: function (result) {
            const newEmployeeID = result.data;

            fillEmployeeProfile(newEmployeeID);
            $("#employeeProfileModal").modal("show");
        }
    });
}


// Delete department, if there are no employees in it ------------------------------

$('.departmentDeleteButton').click(function () {
    var departmentID = $(this).data('id'); // Retrieve the data-id attribute value

    deleteDepartment(departmentID);
});

function deleteDepartment(departmentID) {
    $.ajax({
        url: 'libs/php/deleteDepartmentByID.php',
        type: 'POST',
        dataType: 'json',
        data: {
            id: departmentID
        },
        success: function (response) {
            if (response.status.code === '200') {
                // Department deleted successfully
                getDepartments();
                sweetAlert(`You have successfully deleted the department.`, {
                    icon: "success",
                });
            } else if (response.status.code === '400') {
                // Integrity error - employees associated with the department
                var employeeCount = response.data.employeeCount;
                var departmentName = response.data.departmentName;
                sweetAlert(`There are ${employeeCount} employees in ${departmentName}; you cannot delete it.`, {
                    icon: "error",
                });
            } else {
                // Handle other error cases if needed
                sweetAlert('Error: Department deletion failed.', {
                    icon: "error",
                });
            }
        },
        error: function (xhr, status, error) {
            // Handle the AJAX error
            sweetAlert('AJAX request failed. Error: ' + error, {
                icon: "error",
            });
        }
    });
}




// Create new department -----------------------------------------------------------

function createDepartment() {
    const departmentName = document.getElementById("formDepartmentName").value;
    const locationID = document.getElementById("formLocationDropdown").value;

    $.ajax({
        url: 'libs/php/insertDepartment.php',
        type: 'POST',
        dataType: 'json',
        data: {
            name: departmentName,
            locationID: locationID,
        },
        success: function (result) {
            showAllDepartments();
        },
    });
}

// Delete location, if there are no departments in it ------------------------------

function deleteLocation(locationID, locationName) {
    $.ajax({
        url: 'libs/php/deleteLocationByID.php',
        type: 'POST',
        dataType: 'json',
        data: {
            id: locationID,
        },
        success: function (result) {
            if (result.status.name === "ok") {
                showAllLocations();
                sweetAlert(`You have successfully deleted ${locationName}.`, {
                    icon: "success",
                });
            } else {
                sweetAlert(`There are still departments in ${locationName}; you cannot delete it.`, {
                    icon: "error",
                });
            }
        },
    });
}

//Create new location --------------------------------------------------------------

function createLocation() {
    const locationName = document.getElementById("formLocationName").value;

    $.ajax({
        url: 'libs/php/insertLocation.php',
        type: 'POST',
        dataType: 'json',
        data: {
            name: locationName,
        },
        success: function (result) {
            showAllLocations();
        },
    });
}


// Locations dropdown --------------------------------------------------------------

function getLocationsList() {
    $.ajax({
        url: 'libs/php/getAllLocations.php',
        type: 'POST',
        dataType: 'json',
        data: {},
        success: function (result) {
            const formLocationDropdown = document.getElementById("formLocationDropdown");
            formLocationDropdown.innerHTML = "";

            const locations = result.data;
            locations.sort();

            locations.forEach(function (item) {
                const option = document.createElement("option");
                option.value = item.id;
                option.innerText = item.name;
                formLocationDropdown.appendChild(option);
            });
        },
    });
}


// Departments dropdown ------------------------------------------------------------

function getDepartmentList() {
    $.ajax({
        url: 'libs/php/getAllDepartments.php',
        type: 'POST',
        dataType: 'json',
        data: {},
        success: function (result) {
            const formDepartmentDropdown = document.getElementById("formDepartmentDropdown");
            const formDepartmentDropdownEdit = document.getElementById("formDepartmentDropdownEdit");

            formDepartmentDropdown.innerHTML = "";
            formDepartmentDropdownEdit.innerHTML = "";

            const departments = result.data;
            departments.sort();

            departments.forEach(function (item) {
                const option = document.createElement("option");
                option.value = item.id;
                option.innerText = item.name;
                formDepartmentDropdown.appendChild(option);

                const optionEdit = document.createElement("option");
                optionEdit.value = item.id;
                optionEdit.innerText = item.name;
                formDepartmentDropdownEdit.appendChild(optionEdit);
            });
        },
    });
}


// Update Department dropdown ------------------------------------------------------

function getDepartmentListEdit(selectedDepartmentId) {
    $.ajax({
        url: 'libs/php/getAllDepartments.php',
        type: 'POST',
        dataType: 'json',
        data: {},
        success: function (result) {
            const formDepartmentDropdownEdit = document.getElementById("formDepartmentDropdownEdit");

            formDepartmentDropdownEdit.innerHTML = "";

            const departments = result.data;
            departments.sort();

            departments.forEach(function (item) {
                const option = document.createElement("option");
                option.value = item.id;
                option.innerText = item.name;
                formDepartmentDropdownEdit.appendChild(option);
            });

            formDepartmentDropdownEdit.value = selectedDepartmentId;
        },
    });
}


// Update employee -----------------------------------------------------------------


function updateEmployee() {
    const firstName = document.getElementById("employeeFirstNameEdit").value;
    const lastName = document.getElementById("employeeLastNameEdit").value;
    const email = document.getElementById("employeeEmailEdit").value;
    const jobTitle = document.getElementById("employeeJobTitleEdit").value;
    const departmentID = document.getElementById("formDepartmentDropdownEdit").value;
    const employeeID = currentEmpID;

    $.ajax({
        url: 'libs/php/updatePersonnelByID.php',
        type: 'POST',
        dataType: 'json',
        data: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            jobTitle: jobTitle,
            departmentID: departmentID,
            id: employeeID,
        },
        success: function (results) {
            showEverything();
        },
    });
}


//Update location dropdown ---------------------------------------------------------

function getLocationsListEdit(selectedLocationId) {
    $.ajax({
        url: 'libs/php/getAllLocations.php',
        type: 'POST',
        dataType: 'json',
        data: {},
        success: function (result) {
            const formLocationDropdownEdit = document.getElementById("formLocationDropdownEdit");

            formLocationDropdownEdit.innerHTML = "";

            const locations = result.data;
            locations.sort();

            locations.forEach(function (item) {
                const option = document.createElement("option");
                option.value = item.id;
                option.innerText = item.name;
                formLocationDropdownEdit.appendChild(option);
            });

            formLocationDropdownEdit.value = selectedLocationId;
        },
    });
}


// Update Department ---------------------------------------------------------------

function updateDepartment() {
    const departmentName = document.getElementById("departmentNameEdit").value;
    const locationID = document.getElementById("formLocationDropdownEdit").value;
    const departmentID = currentDepartmentID;

    $.ajax({
        url: 'libs/php/updateDepartmentByID.php',
        type: 'POST',
        dataType: 'json',
        data: {
            name: departmentName,
            locationID: locationID,
            id: departmentID,
        },
        success: function (results) {
            getDepartments();
        },
    });
}


// Update location -----------------------------------------------------------------

function updateLocation() {
    const locationName = document.getElementById("locationNameEdit").value;
    const locationID = currentLocationID;

    $.ajax({
        url: 'libs/php/updateLocationByID.php',
        type: 'POST',
        dataType: 'json',
        data: {
            name: locationName,
            id: locationID,
        },
        success: function (results) {
            showAllLocations();
        },
    });
}


