class NobelWinners {

    constructor(fileName) {
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

    isLoaded() {
        return this._loaded;
    }

    load(jsonString) {
        console.log("Parse JSON");
        this._laureates = JSON.parse(jsonString).laureates;
        this._loaded = true;
    }

    isFilterChanged(startYr, endYr, category, country, gender) {
        return startYr != this._filterObj.start ||
            endYr != this._filterObj.end ||
            category != this._filterObj.category ||
            country != this._filterObj.country ||
            gender != this._filterObj.gender;
    }


    setFilterObj(startYr, endYr, category, country, gender) {
        this._filterObj.start = parseInt(startYr);
        this._filterObj.end = parseInt(endYr);
        this._filterObj.category = category;
        this._filterObj.country = country;
        this._filterObj.gender = gender;
    }



    getLaureate(laureateId) {
        let result = "";
        for (let i = 0; i < this._laureates.length; i++) {
            if (this._laureates[i].id == laureateId)
                result = this._laureates[i];
        }
        return result;
    }

    buildPrizeArray(laureateArr) {
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

    buildPrizeTable(prizeArr) {
        let table = document.createElement("table");
        table.setAttribute("class", "nobels-table");

        let tHead = table.createTHead();
        let tr = tHead.insertRow(0);

        tr.appendChild(NobelWinners._createTH("Year"));
        let thName = tr.appendChild(NobelWinners._createTH("Name"));
        thName.classList.add("nobelname");
        tr.appendChild(NobelWinners._createTH("Category"));
        tr.appendChild(NobelWinners._createTH("Gender"));
        tr.appendChild(NobelWinners._createTH("Born in"));
        tr.appendChild(NobelWinners._createTH("Details"));

        for (let i = 0; i < prizeArr.length; i++) {
            let tr = table.insertRow(i + 1);
            let td = NobelWinners._insertCell(tr, 0);
            td.textContent = prizeArr[i].year;
            td = NobelWinners._insertCell(tr, 1);
            td.textContent = prizeArr[i].laureate.firstname + " " +
                prizeArr[i].laureate.surname;
            td = NobelWinners._insertCell(tr, 2);
            td.textContent = prizeArr[i].category;
            td = NobelWinners._insertCell(tr, 3);
            td.textContent = prizeArr[i].laureate.gender;
            td = NobelWinners._insertCell(tr, 4);
            td.textContent = prizeArr[i].laureate.bornCountry;

            let tdMore = NobelWinners._insertCell(tr, 5);
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

    filterLaureates() {
        let laureateArr = this._laureates;
        laureateArr = laureateArr.filter((laureate) => {
            return NobelWinners._filterYear(laureate, this._filterObj);
        });
        if (this._filterObj.category != "")
            laureateArr = laureateArr.filter(laureate =>
                NobelWinners._filterCategory(laureate, this._filterObj));
        if (this._filterObj.country != "")
            laureateArr = laureateArr.filter((laureate) => {
                let regex = new RegExp(this._filterObj.country, 'gi');
                return laureate.hasOwnProperty('bornCountry') &&
                    laureate.bornCountry.match(regex) != null;
            }, this);
        if (this._filterObj.gender != "") {
            laureateArr = laureateArr.filter(laureate =>
                (this._filterObj.gender == "m" && laureate.gender == "male") ||
                (this._filterObj.gender == "f" && laureate.gender == "female"), this);
        }
        return laureateArr;
    };


    //************************************* PRIVATE METHODS(..But Not really) *************************/

    _createXHR(fileName) {
        let nobelWinners = this;
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", fileName, true);
        xmlhttp.send();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status != 200)
                    alert(this.status + ': ' + fileName + " " + this.statusText);
                else
                if (!nobelWinners.isLoaded())
                    nobelWinners.load(this.responseText);
            }
        }
    }

    static _insertCell(row, n) {
        let td = row.insertCell(n);
        td.classList.add("nobels-table-cell");
        return td;
    }

    static _createTH(content) {
        let th = document.createElement("th");
        th.textContent = content;
        th.classList.add("nobels-table-cell", "nobels-table-hdrcell");
        return th;
    }

    static _filterYear(laureate, filterObj) {
        let accept = false;
        for (let n = 0; n < laureate.prizes.length; n++) {
            let y = laureate.prizes[n].year;
            if (y >= filterObj.start && y <= filterObj.end)
                accept = true;
        }
        return accept;
    };

    static _filterCategory(laureate, filterObj) {
        let accept = false;
        for (let n = 0; n < laureate.prizes.length; n++) {
            if (laureate.prizes[n].category == filterObj.category)
                accept = true;
        }
        return accept;
    };


}

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