// eslint-disable-next-line no-unused-vars
(function(_globalObj) {
    "use strict";

    let laureateArray = [],
        nobelWinners = null,
        results = null,
        filterBtn = null,
        filterCtnr = null;

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", init);
    else
        init();

    function init() {
        results = document.getElementById("results");
        filterBtn = document.getElementById("filterBtn");
        filterCtnr = document.getElementById("filter-ctnr");

        let start = document.getElementById("start");
        let startRange = document.getElementById("startRange");
        start.addEventListener("change", () => {
            if (validateYear(start))
                startRange.value = start.value;
        }, false);
        startRange.addEventListener("change", () => {
            start.value = startRange.value;
        }, false);

        let end = document.getElementById("end");
        let endRange = document.getElementById("endRange");
        end.addEventListener("change", () => {
            if (validateYear(end))
                endRange.value = end.value;
        }, false);
        endRange.addEventListener("change", () => {
            end.value = endRange.value;
        }, false);

        filterBtn.addEventListener("click", () => {
            if (filterCtnr.style.display == "flex" && checkUserInput(start, end))
                doSubmit(start, end);
            toggleFilterCtnr();
        }, false);
        filterBtn.dispatchEvent(new Event("click"));
        getLaureateArray("./assets/nobelWinners.json");
    }

    function getLaureateArray(fileName) {
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", fileName, true);
        xmlhttp.send();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status != 200)
                    alert(this.status + ": " + fileName + " " + this.statusText);
                else {
                    // eslint-disable-next-line no-console
                    console.log("Parse JSON");
                    laureateArray = JSON.parse(this.responseText).laureates;
                }
            }
        };
    }

    function toggleFilterCtnr() {
        if (filterCtnr.style.display != "flex")
            filterCtnr.style.display = "flex";
        else
            filterCtnr.style.display = "";
    }

    function checkUserInput(start, end) {
        let isValid = true;
        if (!validateYear(start)) {
            results.textContent = "Invalid Start Year";
            isValid = false;
        }
        if (!validateYear(end)) {
            results.textContent = "Invalid End Year";
            isValid = false;
        }

        if (isValid && parseInt(start.value) > parseInt(end.value)) {
            results.textContent = "End year must be later than start year";
            isValid = false;
        }
        return isValid;
    }

    function doSubmit(start, end) {
        if (end.value == "") {
            end.value = 2018;
            end.dispatchEvent(new Event("change"));
        }

        if (start.value == "") {
            start.value = end.value;
            start.dispatchEvent(new Event("change"));
        }

        let category = document.getElementById("category").value;
        let country = document.getElementById("country").value;
        let gender = "";
        if (document.getElementById("gendermale").checked)
            gender = "m";
        else {
            if (document.getElementById("genderfemale").checked)
                gender = "f";
        }

        if (laureateArray.length == 0) {
            results.textContent = "Laureate data not loaded";
            return;
        }
        if (nobelWinners == null)
        // eslint-disable-next-line no-undef
            nobelWinners = new NobelWinners(laureateArray);

        if (nobelWinners.isFilterChanged(start.value, end.value, category, country, gender)) {
            nobelWinners.setFilterObj(start.value, end.value, category, country, gender);
            let filteredArr =
                nobelWinners.filterLaureates();
            if (filteredArr.length == 0)
                results.textContent = "No laureates match these criteria";
            else {
                let prizeArr = nobelWinners.buildPrizeArray(filteredArr);
                while (results.hasChildNodes()) {
                    results.removeChild(results.lastChild);
                }
                results.appendChild(nobelWinners.buildPrizeTable(prizeArr));
            }
        }
    }

    function validateYear(yearEl) {
        let isValid = true;
        if (yearEl.checkValidity() == false) {
            results.textContent = "Invalid Year";
            isValid = false;
        }
        return isValid;
    }

}(this));