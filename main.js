(function(globalObj) {
    'use strict'

    let nobelWinners = new NobelWinners("nobelWinners.json");
    let display = null;

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", init);
    else
        init();

    function init() {
        display = document.getElementById("id04");
        let start = document.getElementById("start");
        let startRange = document.getElementById("startRange");
        // here using an arrow function
        start.addEventListener("change", () => {
            if (validateYear(start))
                startRange.value = start.value;
        }, false);
        startRange.addEventListener("change", function() {
            start.value = startRange.value;
        }, false);

        let end = document.getElementById("end");
        let endRange = document.getElementById("endRange");
        end.addEventListener("change", function() {
            if (validateYear(end))
                endRange.value = end.value;
        }, false);
        endRange.addEventListener("change", function() {
            end.value = endRange.value;
        }, false);

        let submit = document.getElementById("submitBtn");
        submit.addEventListener("click", function() {
            if (checkUserInput(start, end)) {
                doSubmit(start, end)
            }
        }, false);
    }

    function checkUserInput(start, end) {
        let isValid = true;
        if (!validateYear(start)) {
            display.textContent = "Invalid Start Year";
            isValid = false;
        }
        if (!validateYear(end)) {
            display.textContent = "Invalid End Year";
            isValid = false;
        }

        if (end.value == "") {
            end.value = 2018;
            end.dispatchEvent(new Event('change'));
        }

        if (start.value == "") {
            start.value = end.value;
            start.dispatchEvent(new Event('change'));
        }

        if (isValid && parseInt(start.value) > parseInt(end.value)) {
            display.textContent = "End year must be later than start year"
            isValid = false
        }
        return isValid;
    }

    function doSubmit(start, end) {
        if (!nobelWinners.isLoaded()) {
            display.textContent = "Laureate data not loaded";
            return;
        }
        let category = document.getElementById("category").value;
        let country = document.getElementById("country").value;
        let gender = "";
        if (document.getElementById('gendermale').checked)
            gender = "m";
        else {
            if (document.getElementById('genderfemale').checked)
                gender = "f";
        }

        if (nobelWinners.isFilterChanged(start.value, end.value, category, country, gender)) {
            nobelWinners.setFilterObj(start.value, end.value, category, country, gender);
            let filteredArr =
                nobelWinners.filterLaureates();
            if (filteredArr.length == 0)
                display.textContent = "No laureates match these criteria";
            else {
                let prizeArr = nobelWinners.buildPrizeArray(filteredArr);
                while (display.hasChildNodes()) {
                    display.removeChild(display.lastChild);
                }
                display.appendChild(nobelWinners.buildPrizeTable(prizeArr));
            }
        }
        toggleGenderCol();
    }


    // Bug in IE requires setting border
    function toggleGenderCol() {
        let e = document.getElementsByClassName("gendercol");
        for (let i = 0; i < e.length; i++) {
            if (e[i].style.visibility != 'visible') {
                e[i].style.visibility = 'visible';
                e[i].style.border = "solid";
            } else {
                e[i].style.visibility = 'hidden';
                e[i].style.border = "none";
            }
        }
    };


    function validateYear(yearEl) {
        let isValid = true;
        if (yearEl.checkValidity() == false) {
            display.textContent = "Invalid Year";
            isValid = false;
        }
        return isValid;
    }

}(this))