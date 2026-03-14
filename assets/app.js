const WikiDisplay = document.getElementById("WikiDisplay")
const LinkDisplay = document.getElementById("LinkDisplay")
const RerollButton = document.getElementById("RerollButton")
const Counter = document.getElementById("Counter")
const LinkHistList = document.getElementById("LinkHistList")
const SuccessButton = document.getElementById("SubmitButton")
const RunNameInput = document.getElementById("RunNameInput")
const LeaderboardBody = document.getElementById("LeaderboardBody")
const Hyperlink = document.getElementById("Hyperlink")
const Language = document.getElementById("Language")
const WordFilter = document.getElementById("WordFilter")

var CurrentLang = "en"
var FilteredList = []
var PageCount = 0

function changeFilterList(sentence) {
    FilteredList = sentence
    .trim()
    .split(",")
    .map(value => value.trim().toLowerCase())
}

function displayURL(finalURL) {
    const shownURL = new URL(finalURL)

    WikiDisplay.src = shownURL
    LinkDisplay.textContent = shownURL
    Hyperlink.href = shownURL
}

function addHistory(finalURL) {
    const listItem = document.createElement("li")
    const link = document.createElement("a")
    link.href = finalURL
    link.textContent = finalURL
    LinkHistList.insertBefore(listItem, LinkHistList.firstChild)
    listItem.appendChild(link)

    /*
        <li>
            <a href="URL"> URL </a>
        </li>
    */
}

function changeCount(value) {
    PageCount += value
    if (PageCount < 0) {PageCount = 0}
    Counter.textContent = PageCount
}

function changeLanguage(value) {
    let CurrentLang = value

    const finalURL = `https://${CurrentLang}.wikipedia.org`
    displayURL(finalURL)
}

var debounce = false
async function getURL() {
    if (debounce) {return}
    debounce = true

    const apiEndPoint = `https://${CurrentLang}.wikipedia.org/w/api.php`

    const params = new URLSearchParams({
        action: "query",
        list: "random",
        format: "json",
        rnlimit: "5",
        rnnamespace: "0",
        rnminsize: "1250",
        origin: "*"
    })

    try {
        function isPageValid(pageTitle) {
            return !FilteredList.some(word => pageTitle.includes(word))
        }

        let finalPage
        let attempts = 0

        while (!finalPage && attempts < 3) {
            const response = await fetch(`${apiEndPoint}?${params.toString()}`)
            const data = await response.json()
            const pages = data.query.random

            pages.forEach(page => {
                const pageTitle = page.title.toLowerCase()
                if (isPageValid(pageTitle)) {
                    finalPage = page
                }
            })

            attempts++
        }

        if (!finalPage) {
            alert(`After ${attempts} attemps and ${parseInt(params.get("rnlimit")) * attempts} pages, no valid page was found. Please retry.`)
            debounce = false
            return
        }

        const pageTitle = finalPage.title.replace(/ /g, "_")
        const finalURL = `https://${CurrentLang}.wikipedia.org/wiki/${pageTitle}`

        debounce = false
        return finalURL

    } catch (error) {
        alert(error)
        debounce = false
    }
}

async function rerollPage(increment) {
    const finalURL = await getURL()

    if (finalURL) {
        displayURL(finalURL)
        addHistory(finalURL)
        changeCount(increment)
    }
}

async function skipPage() {
    const finalURL = await getURL()

    if (finalURL) {
        LinkHistList.firstChild.remove()
        displayURL(finalURL)
        addHistory(finalURL)
    }
}

function sortTable() {
  const rows = Array.from(LeaderboardBody.querySelectorAll('tr'))

  rows.sort((a, b) => {
    const first = a.cells[2].textContent
    const last = b.cells[2].textContent

    return parseInt(first) - parseInt(last)
  });

  rows.forEach(row => LeaderboardBody.appendChild(row))
}

function setLocalData() {
    const keys = Object.keys(localStorage)

    if (keys.length > 0) {
        LeaderboardBody.innerHTML = ""

        keys.forEach(key => {
            const data = JSON.parse(localStorage.getItem(key))
            const row = document.createElement("tr")

            const rowData = [key, data["Date"], data["Score"]]

            rowData.forEach(item => {
                const dataCell = document.createElement("td")
                dataCell.textContent = item
                row.appendChild(dataCell)
            })

            LeaderboardBody.appendChild(row)

            sortTable()
        })
    }
}

function saveGame() {
    let RunName = RunNameInput.value;
    let errorMessage

    if (!RunName || localStorage.getItem(RunName)) {
        errorMessage = "Invalid Run Name! Make sure the name is not duplicate."
    }
    if (PageCount <= 0) {
        errorMessage = "Invalid Score! Make sure you roll at least once."
    }

    if (errorMessage) {
        alert(errorMessage)
        return
    }
    
    date = new Date()
    year = date.getFullYear()
    month = date.toLocaleString("default", { month: "short" })
    day = date.getDate()
    hours = date.getHours()
    minutes = date.getMinutes()
    seconds = date.getSeconds()

    fullDate = `${month} ${day}, ${year}; ${hours}:${minutes}:${seconds}`

    let data = {
        "Date": fullDate,
        "Score": String(PageCount),
        "FinalURL": LinkDisplay.textContent
    }

    localStorage.setItem(RunName, JSON.stringify(data))
    setLocalData()

    alert("Success!")

    PageCount = 0
    Counter.textContent = PageCount
    LinkHistList.innerHTML = ""

    const finalURL =`https://${CurrentLang}.wikipedia.org`
    displayURL(finalURL)
}

setLocalData()
displayURL(`https://${CurrentLang}.wikipedia.org/`)