'use strict'

function NobelWinners(fileName) {
    this._laureates = [];
    this._loaded = false;
    this._filterObj = {
        'start': 0,
        'end': 0,
        'category': "",
        'country': "",
        'gender': ""
    }
    this._createXHR(fileName);
}

NobelWinners.prototype.isLoaded = function() {
    return this._loaded;
}

NobelWinners.prototype.load = function(jsonString) {
    this._laureates = JSON.parse(jsonString).laureates;
    this._loaded = true;
}


NobelWinners.prototype.isFilterChanged = function(startYr, endYr, category, country, gender) {
    return startYr != this._filterObj.start ||
        endYr != this._filterObj.end ||
        category != this._filterObj.category ||
        country != this._filterObj.country ||
        gender != this._filterObj.gender;
}


NobelWinners.prototype.setFilterObj = function(startYr, endYr, category, country, gender) {
    this._filterObj.start = parseInt(startYr);
    this._filterObj.end = parseInt(endYr);
    this._filterObj.category = category;
    this._filterObj.country = country;
    this._filterObj.gender = gender;
}



NobelWinners.prototype.getLaureate = function(laureateId) {
    let result = "";
    for (let i = 0; i < this._laureates.length; i++) {
        if (this._laureates[i].id == laureateId)
            result = this._laureates[i];
    }
    return result;
}

NobelWinners.prototype.buildPrizeArray = function(laureateArr) {
    let prizeArr = [];
    for (let i = 0; i < laureateArr.length; i++) {
        for (let n = 0; n < laureateArr[i].prizes.length; n++) {
            if (laureateArr[i].prizes[n].year >= this._filterObj.start &&
                laureateArr[i].prizes[n].year <= this._filterObj.end &&
                (this._filterObj.category == "" ||
                    this._filterObj.category == laureateArr[i].prizes[n].category)) {
                let lPrize = {};
                lPrize.laureate = laureateArr[i];
                lPrize.prizeIndex = n;
                lPrize.year = laureateArr[i].prizes[n].year;
                lPrize.category = laureateArr[i].prizes[n].category;
                prizeArr.push(lPrize);
            }
        }
    };
    return prizeArr.sort((a, b) => a.year - b.year);
}

NobelWinners.prototype.buildPrizeTable = function(prizeArr) {
    let table = document.createElement("table");
    table.setAttribute("class", "resultstable");

    let tHead = table.createTHead();
    let tr = tHead.insertRow(0);

    tr.appendChild(_createTH("Year"));
    let thName = tr.appendChild(_createTH("Name"));
    thName.setAttribute("class", "resultname");
    tr.appendChild(_createTH("Category"));
    tr.appendChild(_createTH("Gender"));
    tr.appendChild(_createTH("Born in"));
    tr.appendChild(_createTH("Details"));

    for (let i = 0; i < prizeArr.length; i++) {
        let tr = table.insertRow(i + 1);
        tr.insertCell(0).textContent = prizeArr[i].year;
        let nm = tr.insertCell(1);
        nm.setAttribute("class", "resultname");
        nm.textContent = prizeArr[i].laureate.firstname + " " +
            prizeArr[i].laureate.surname;
        tr.insertCell(2).textContent = prizeArr[i].category;
        tr.insertCell(3).textContent = prizeArr[i].laureate.gender;
        tr.insertCell(4).textContent = prizeArr[i].laureate.bornCountry;

        let tdMore = tr.insertCell(5);
        let detailEl = document.createElement("details");
        tdMore.appendChild(detailEl);
        let summaryEl = document.createElement("summary");
        detailEl.appendChild(summaryEl);
        let laureate = this.getLaureate(prizeArr[i].laureate.id);
        let moreDetails = _moreInformation(laureate, prizeArr[i].prizeIndex);
        if (moreDetails instanceof HTMLElement) {
            summaryEl.textContent = "More...";
            detailEl.appendChild(moreDetails);
        } else
            summaryEl.textContent = "N/A";
    }
    return table;
};

NobelWinners.prototype.filterLaureates = function() {
    let laureateArr = this._laureates;
    laureateArr = laureateArr.filter((laureate) => {
        return _filterYear(laureate, this._filterObj);
    });
    if (this._filterObj.category != "")
        laureateArr = laureateArr.filter((laureate) => {
            return _filterCategory(laureate, this._filterObj);
        });
    if (this._filterObj.country != "")
        laureateArr = laureateArr.filter((laureate) => {
            let regex = new RegExp(this._filterObj.country, 'gi');
            return laureate.hasOwnProperty('bornCountry') &&
                laureate.bornCountry.match(regex) != null;
        }, this);
    if (this._filterObj.gender != "") {
        laureateArr = laureateArr.filter(function(laureate) {
            return (this._filterObj.gender == "m" && laureate.gender == "male") ||
                (this._filterObj.gender == "f" && laureate.gender == "female")
        }, this);
    }
    return laureateArr;
};


//************************************* PRIVATE METHODS *************************/

NobelWinners.prototype._createXHR = function(fileName) {
    let nobelWinners = this;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", fileName, true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState != 4)
            return;
        if (this.status != 200) {
            alert(this.status + ': ' + fileName + " " + this.statusText);
        } else {
            console.log("Parse JSON");
            nobelWinners.load(this.responseText);
        }
    }
}

function _createTH(content) {
    let th = document.createElement("th");
    th.textContent = content;
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
};

function _filterCategory(laureate, filterObj) {
    let accept = false;
    for (let n = 0; n < laureate.prizes.length; n++) {
        if (laureate.prizes[n].category == filterObj.category)
            accept = true;
    }
    return accept;
};

function _moreInformation(laureate, prizeIndex) {
    let moreElmnt = {};
    if (laureate != "") {
        let prize = laureate.prizes[prizeIndex];
        let infoElmnt = document.createElement("p");
        infoElmnt.setAttribute("class", "moreInfo");
        if (laureate.born != "0000-00-00")
            infoElmnt.appendChild(document.createTextNode("Year of birth: " + laureate.born));
        if (laureate.hasOwnProperty('bornCity')) {
            infoElmnt.appendChild(document.createElement("br"));
            infoElmnt.appendChild(document.createTextNode("City of birth: " + laureate.bornCity));
        }
        if (laureate.died != "0000-00-00") {
            infoElmnt.appendChild(document.createElement("br"));
            infoElmnt.appendChild(document.createTextNode("Died in:  " + laureate.died));
        }
        if (prize.hasOwnProperty('motivation')) {
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
        };
        if (infoElmnt.textContent && infoElmnt.textContent.length > 0)
            moreElmnt = infoElmnt;
    }
    return moreElmnt;
};

// let winners = new NobelWinners();
// if (lc.filterObj.isChanged(0, 0, "", "", ""))
//     console.log("Changed = yes");
// else
//     console.log("Changed is NO");