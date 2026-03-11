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
var PageCount = 0

function displayURL(finalURL) {
    const shownURL = new URL(finalURL)

    WikiDisplay.src = shownURL
    LinkDisplay.textContent = shownURL
    Hyperlink.href = shownURL
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
        format: "json",
        list: "random",
        rnlimit: "1",
        rnnamespace: "0",
        origin: "*"
    })

    try {
        const response = await fetch(`${apiEndPoint}?${params.toString()}`)
        const data = await response.json()
        const page = data.query.random[0]
        const pageTitle = page.title.replace(/ /g, "_")

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

        const listItem = document.createElement("li")
        const link = document.createElement("a")
        link.href = finalURL
        link.textContent = finalURL
        LinkHistList.insertBefore(listItem, LinkHistList.firstChild)
        listItem.appendChild(link)

        changeCount(increment)
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

    date = new Date()
    year = date.getFullYear()
    month = date.toLocaleString("default", { month: "short" })
    day = date.getDate()
    hours = date.getHours()
    minutes = date.getMinutes()
    seconds = date.getSeconds()

    fullDate = `${month} ${day}, ${year}; ${hours}:${minutes}:${seconds}`

    var data = {
        "Date": fullDate,
        "Score": String(PageCount),
        "FinalURL": LinkDisplay.textContent
    }

    localStorage.setItem(RunName, JSON.stringify(data))
    setLocalData()

    alert("Success!")

    PageCount = 0
    Counter.textContent = PageCount

    const finalURL =`https://${CurrentLang}.wikipedia.org`
    displayURL(finalURL)
}

setLocalData()
displayURL(`https://${CurrentLang}.wikipedia.org/`)