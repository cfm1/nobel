import NobelWinners from "./nobelWinners.js";

// eslint-disable-next-line no-unused-vars
(function(_globalObj) {
    "use strict";

    let viewMap = new Map(),
        currentView = null,
        filterBtn = null,
        nobelWinners = null;


    if (document.readyState !== "loading")
        init();
    else
        document.addEventListener("DOMContentLoaded", init);

    function init() {
        window.addEventListener("click", () => handleDocEvent(), false);
        window.addEventListener("keydown", () => handleDocEvent(), false);
        window.addEventListener("touchend", () => handleDocEvent(), false);
        filterBtn = document.getElementById("filterBtn");
        filterBtn.addEventListener("click", () => handleFilterBtn(), false);
        setTimeout(() => {
            getJSONObj("./json/nobelWinners.json", (jsonObj) => {
                nobelWinners = new NobelWinners(jsonObj.laureates);
                buildCountryList(nobelWinners.getCountries());
                doFilter("2018", "2018", "", "", "");
            });
        }, 1000);

        window.addEventListener("resize", () => {
            calcViewHeight();
        });
        calcViewHeight();
        selectView("table-view");
    }

    function calcViewHeight() {
        let hdr = document.getElementById("hdr");
        let ftr = document.getElementById("footr");
        let footerHeight = parseFloat(getComputedStyle(ftr).getPropertyValue("height"));
        let hdrHeight = parseFloat(getComputedStyle(hdr).getPropertyValue("height"));
        let vHeight = parseFloat(getComputedStyle(document.body).getPropertyValue("height")) -
            hdrHeight - footerHeight;
        if (vHeight < 0)
            vHeight = 0;
        document.documentElement.style.setProperty("--view-height",
            `${vHeight}px`);
    }

    function handleDocEvent() {
        if (currentView.id === "filter-view") {
            if (event.which === 27) {
                selectView("table-view");
                return;
            }
            if (filterBtn == document.activeElement ||
                document.body === document.activeElement ||
                viewMap.get("filter-view").contains(document.activeElement))
                return;

            handleFilterBtn();
        }
    }

    function handleFilterBtn() {
        if (currentView.id != "filter-view")
            selectView("filter-view");
        else
            selectView("table-view");

        if (currentView.id === "filter-view")
            currentView.focus();
        else
            filterBtn.focus();
    }

    function getJSONObj(url, jsonLoadedFn) {
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status != 200)
                    alert(this.status + ": " + url + " " + this.statusText);
                else {
                    // eslint-disable-next-line no-console
                    console.log("Parse JSON");
                    jsonLoadedFn(JSON.parse(this.responseText));
                    let loader = document.getElementById("loader");
                    document.body.removeChild(loader);
                }
            }
        };
    }

    function selectView(viewId) {
        if (currentView != null) {
            if (currentView.id === viewId)
                return currentView;
            else
                currentView.style.display = "none";
        }
        let v = viewMap.get(viewId);
        if (v === undefined) {
            v = document.getElementById(viewId);
            // check v exists
            initView(v);
            viewMap.set(viewId, v);
        }
        currentView = v;
        currentView.style.display = "flex";
        return currentView;
    }

    function doFilter(startVal, endVal, categoryVal, countryVal, genderVal) {
        if (nobelWinners.isFilterChanged(startVal, endVal, categoryVal, countryVal, genderVal)) {
            nobelWinners.setFilterObj(startVal, endVal, categoryVal, countryVal, genderVal);
            let filteredArr =
                nobelWinners.filterLaureates();
            let tableView = selectView("table-view");
            let prizeTbl =
                nobelWinners.buildPrizeTable(nobelWinners.buildPrizeArray(filteredArr));
            while (tableView.hasChildNodes()) {
                tableView.removeChild(tableView.lastChild);
            }
            tableView.appendChild(prizeTbl);
        }
        selectView("table-view");
    }

    function suggest(event) {
        let country = event.target;
        let countryList = document.getElementById("country_list");
        let allCountries = nobelWinners.getCountries();
        if (country.value.length < 0)
            return;
        countryList.innerHTML = "";
        let suggested = [];
        for (let i = 0; i < allCountries.length; i++) {
            if (allCountries[i].toUpperCase().startsWith(country.value.toUpperCase()))
                suggested.push(allCountries[i]);
        }
        buildCountryList(suggested);
    }

    function initView(view) {
        view.scrollTop = 0;
        if (view.id === "filter-view") {
            let start = document.getElementById("start");
            start.value = "2018";
            let end = document.getElementById("end");
            end.value = "2018";
            let country = document.getElementById("country");
            country.value = "";
            country.addEventListener("keyup", event => suggest(event));
            document.getElementById("category").value = "";
            let filterOK = document.getElementById("filterOK");
            filterOK.addEventListener("click", () => doSubmit(), false);
        }
    }

    function doSubmit() {
        if (nobelWinners.getLaureates().length == 0) {
            let tableView = selectView("table-view");
            tableView.textContent = "Laureate data not loaded";
            return;
        }
        let start = document.getElementById("start");
        let end = document.getElementById("end");
        if (!checkUserInput(start, end))
            return;
        let gender = "";
        if (document.getElementById("gendermale").checked)
            gender = "m";
        else {
            if (document.getElementById("genderfemale").checked)
                gender = "f";
        }

        let category = document.getElementById("category");
        let country = document.getElementById("country");

        doFilter(start.value, end.value, category.value, country.value, gender);
    }

    function checkUserInput(start, end) {
        let isValid = true;
        let startV = parseInt(start.value);
        let endV = parseInt(end.value);
        if (start.value == "" || isNaN(startV) || startV < 1901)
            start.value = 1901;
        if (end.value == "" || isNaN(endV) || endV < 1901)
            end.value = 1901;
        if (startV > 2018)
            start.value = 2018;
        if (endV > 2018)
            end.value = 2018;

        if (startV > endV)
            start.value = end.value;
        return isValid;
    }



    function buildCountryList(countries) {
        let dataList = document.getElementById("country_list");
        for (let i = 0; i < countries.length; i++) {
            let optionEl = document.createElement("option");
            optionEl.textContent = countries[i];
            dataList.appendChild(optionEl);
        }
    }

}(this));