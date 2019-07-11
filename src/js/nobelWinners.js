export default class NobelWinners {

    static buildCountries(laureateArr) {
        let countries = [];
        for (let i = 0; i < laureateArr.length; i++) {
            if (laureateArr[i].hasOwnProperty("bornCountry")) {
                let bCountry = _getNowCountry(
                    new String(laureateArr[i].bornCountry).trim());
                if (countries.indexOf(bCountry) == -1)
                    countries.push(bCountry);
            }
        }
        return countries.sort();
    }


    constructor(laureateArray) {
        this.getLaureates = function() {
            return laureateArray;
        };

        let _filterObj = {
            "start": 0,
            "end": 0,
            "category": "",
            "country": "",
            "gender": ""
        };
        this.getFilterObj = function() {
            return _filterObj;
        };

        this.setFilterObj = function(startYr, endYr, category, country, gender) {
            _filterObj.start = parseInt(startYr);
            _filterObj.end = parseInt(endYr);
            _filterObj.category = category;
            _filterObj.country = country;
            _filterObj.gender = gender;
        };

        this.isFilterChanged = function(startYr, endYr, category, country, gender) {
            return startYr != _filterObj.start ||
                endYr != _filterObj.end ||
                category != _filterObj.category ||
                country != _filterObj.country ||
                gender != _filterObj.gender;
        };

        const _countries = NobelWinners.buildCountries(laureateArray);
        this.getCountries = function() {
            return _countries;
        };
    }

    getLaureate(laureateId) {
        let result = "";
        for (let i = 0; i < this.getLaureates().length; i++) {
            if (this.getLaureates()[i].id == laureateId)
                result = this.getLaureates()[i];
        }
        return result;
    }

    buildPrizeArray(laureateArr) {
        let prizeArr = [];
        for (let i = 0; i < laureateArr.length; i++) {
            for (let n = 0; n < laureateArr[i].prizes.length; n++) {
                if (laureateArr[i].prizes[n].year >= this.getFilterObj().start &&
                    laureateArr[i].prizes[n].year <= this.getFilterObj().end &&
                    (this.getFilterObj().category == "" ||
                        this.getFilterObj().category == laureateArr[i].prizes[n].category)) {
                    let lPrize = {};
                    lPrize.laureate = laureateArr[i];
                    lPrize.prizeIndex = n;
                    lPrize.year = laureateArr[i].prizes[n].year;
                    lPrize.category = laureateArr[i].prizes[n].category;
                    prizeArr.push(lPrize);
                }
            }
        }
        return prizeArr.sort((a, b) => a.year - b.year);
    }

    buildPrizeTable(prizeArr) {
        let table = document.createElement("table");
        table.setAttribute("class", "nbl-table");
        let tBody = document.createElement("tbody");
        let tr = table.insertRow(0);
        let td = tr.insertCell(0);
        td.appendChild(tBody);

        let tHead = table.createTHead();
        tr = tHead.insertRow(0);
        tr.appendChild(_createHdrCell("Year", "nbl-year"));
        tr.appendChild(_createHdrCell("Name", "nbl-name"));
        tr.appendChild(_createHdrCell("Category", "nbl-category"));
        tr.appendChild(_createHdrCell("Born in", "nbl-country"));
        tr.appendChild(_createHdrCell("Gender", "nbl-gender"));
        tr.appendChild(_createHdrCell("More ...", "nbl-moreinfo"));

        for (let i = 0; i < prizeArr.length; i++) {
            let tr = table.insertRow(i + 1);

            let td = _createCell(tr, 0, "nbl-year");
            td.textContent = prizeArr[i].year;

            td = _createCell(tr, 1, "nbl-name");
            td.textContent = prizeArr[i].laureate.firstname + " " +
                prizeArr[i].laureate.surname;

            td = _createCell(tr, 2, "nbl-category");
            td.textContent = prizeArr[i].category;

            td = _createCell(tr, 3, "nbl-country");
            td.textContent = prizeArr[i].laureate.bornCountry;

            td = _createCell(tr, 4, "nbl-gender");
            td.textContent = prizeArr[i].laureate.gender;

            let tdMore = _createCell(tr, 5, "nbl-moreinfo");
            let detailEl = document.createElement("details");
            tdMore.appendChild(detailEl);
            let summaryEl = document.createElement("summary");
            detailEl.appendChild(summaryEl);
            let laureate = this.getLaureate(prizeArr[i].laureate.id);
            let moreDetails = _moreInformation(laureate, prizeArr[i].prizeIndex);
            if (moreDetails instanceof HTMLElement) {
                summaryEl.textContent = "...";
                detailEl.appendChild(moreDetails);
            } else
                summaryEl.textContent = "N/A";
        }
        return table;
    }

    filterLaureates() {
        let laureateArr = this.getLaureates();
        laureateArr = laureateArr.filter(laureate =>
            _filterYear(laureate, this.getFilterObj()));
        if (this.getFilterObj().category != "")
            laureateArr = laureateArr.filter(laureate =>
                _filterCategory(laureate, this.getFilterObj()));
        if (this.getFilterObj().country != "")
            laureateArr = laureateArr.filter(laureate => {
                if (laureate.hasOwnProperty("bornCountry")) {
                    let country = _getNowCountry(laureate.bornCountry);
                    return this.getFilterObj().country === country;
                }
            }, this);
        if (this.getFilterObj().gender != "") {
            laureateArr = laureateArr.filter(laureate =>
                (this.getFilterObj().gender == "m" && laureate.gender == "male") ||
                (this.getFilterObj().gender == "f" && laureate.gender == "female"), this);
        }
        return laureateArr;
    }
}


//**************************************************************************** */

function _getNowCountry(bornCountry) {
    let country = bornCountry;
    let idx = country.lastIndexOf("(now");
    if (idx != -1) {
        let end = country.lastIndexOf(")");
        country = country.substr(idx + 5, end - idx - 5);
    }
    return country;
}

function _createCell(row, n, className) {
    let td = row.insertCell(n);
    td.classList.add("nbl-table-cell");
    td.classList.add(className);
    return td;
}

function _createHdrCell(content, className) {
    let th = document.createElement("th");
    th.textContent = content;
    th.classList.add("nbl-table-cell", "nbl-table-hdrcell");
    th.classList.add(className);
    return th;
}

function _filterYear(laureate, filterObj) {
    let accept = false;
    for (let n = 0; n < laureate.prizes.length; n++) {
        let y = laureate.prizes[n].year;
        if (y >= filterObj.start && y <= filterObj.end)
            accept = true;
    }
    return accept;
}

function _filterCategory(laureate, filterObj) {
    let accept = false;
    for (let n = 0; n < laureate.prizes.length; n++) {
        if (laureate.prizes[n].category == filterObj.category)
            accept = true;
    }
    return accept;
}


function _moreInformation(laureate, prizeIndex) {
    let moreElmnt = {};
    if (laureate != "") {
        let prize = laureate.prizes[prizeIndex];
        let infoElmnt = document.createElement("p");
        if (laureate.born != "0000-00-00")
            infoElmnt.appendChild(document.createTextNode("Year of birth: " + laureate.born));
        if (laureate.hasOwnProperty("bornCity")) {
            infoElmnt.appendChild(document.createElement("br"));
            infoElmnt.appendChild(document.createTextNode("City of birth: " + laureate.bornCity));
        }
        if (laureate.died != "0000-00-00") {
            infoElmnt.appendChild(document.createElement("br"));
            infoElmnt.appendChild(document.createTextNode("Died in:  " + laureate.died));
        }
        if (prize.hasOwnProperty("motivation")) {
            infoElmnt.appendChild(document.createElement("br"));
            infoElmnt.appendChild(document.createTextNode("Motivation: " + prize.motivation));
        }

        for (let i = 0; i < prize.affiliations.length; i++) {
            let nm = prize.affiliations[i].name == undefined ? "" : prize.affiliations[i].name;
            let city = prize.affiliations[i].city == undefined ? "" : prize.affiliations[i].city;
            if (nm != "" && city != "") {
                infoElmnt.appendChild(document.createElement("br"));
                infoElmnt.appendChild(document.createTextNode("Affiliation: " + nm + ", " + city));
            }
        }
        if (infoElmnt.textContent && infoElmnt.textContent.length > 0)
            moreElmnt = infoElmnt;
    }
    return moreElmnt;
}