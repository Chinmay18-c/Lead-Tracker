let myLeads = [];
const inputEl = document.getElementById("input-el");
const inputBtn = document.getElementById("input-btn");
const ulEl = document.getElementById("ul-el");
const deleteBtn = document.getElementById("delete-btn");
const tabBtn = document.getElementById("tab-btn");
const tagSelect = document.getElementById("tag-select");
const exportBtn = document.getElementById("export-btn");

const config = {
    defaultTag: "Uncategorized",
    debounceDelay: 300
};

const leadsFromLocalStorage = JSON.parse(localStorage.getItem("myLeads")) || [];
if (leadsFromLocalStorage.length) {
    myLeads = leadsFromLocalStorage;
    renderLeads(myLeads);
}

const storage = {
    save(leads) {
        try {
            localStorage.setItem("myLeads", JSON.stringify(leads));
        } catch (e) {
            console.error("Failed to save leads:", e);
        }
    },
    clear() {
        localStorage.clear();
    }
};

function renderLeads(leads) {
    const fragment = document.createDocumentFragment();
    leads.forEach((lead, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <a target='_blank' href='${lead.url}'>${lead.url}</a>
            <span> [${lead.tag}] </span>
            <button class="delete-one" data-index="${index}">Delete</button>
        `;
        fragment.appendChild(li);
    });
    ulEl.innerHTML = "";
    ulEl.appendChild(fragment);
}

function addLead(url, tag = tagSelect.value) {
    myLeads.push({ url, tag, timestamp: Date.now() });
    storage.save(myLeads);
    renderLeads(myLeads);
}

tabBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url) addLead(tabs[0].url);
    });
});

inputBtn.addEventListener("click", debounce(() => {
    const value = inputEl.value.trim();
    if (value) {
        addLead(value);
        inputEl.value = "";
    }
}, config.debounceDelay));

deleteBtn.addEventListener("dblclick", () => {
    myLeads = [];
    storage.clear();
    renderLeads(myLeads);
});

ulEl.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-one")) {
        const index = e.target.dataset.index;
        myLeads.splice(index, 1);
        storage.save(myLeads);
        renderLeads(myLeads);
    }
});

exportBtn.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(myLeads));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "leads.json");
    downloadAnchor.click();
});

function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}