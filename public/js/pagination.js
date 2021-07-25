const pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
let currentPage = 1;
const listEl = document.querySelector("#pages");

function setPage() {
	currentPage = parseInt(this.dataset.page);
    pagination(pages);
}

function addPages(newPages) {
    for (let i = 0; i < newPages.length; i++) {
        li = document.createElement("li");
        if (newPages[i] == currentPage) {
            li.className = "actualPage"
        }
        if (newPages[i] != "...") {
            a = document.createElement("a")
            a.innerText = newPages[i];
        	a.dataset.page = newPages[i];
            a.onclick = setPage;
            li.appendChild(a)
        } else {
            li.innerText = newPages[i];
        }
        listEl.appendChild(li);
    }
}

function pagination(pages) {
    listEl.innerHTML = "";
    let totalPages = pages.length;
    
    let prevbutton = document.querySelector("#prevButton");
    prevButton.disabled = (currentPage == 1);
    let nextButton = document.querySelector("#nextButton");
    nextButton.disabled = (currentPage == pages.length);

    if (totalPages <= 7) {
        addPages(pages);
        return;
    }
    
    if (currentPage <= 4) {
        addPages([1, 2, 3, 4, 5]);
    } else {
        addPages([1, "..."]);
    }
    
    if (currentPage > 4 && currentPage < totalPages - 3) {
        addPages([currentPage - 1, currentPage, currentPage + 1]);
    }
    
    if (currentPage >= totalPages - 3) {
        addPages([totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]);
    } else {
        addPages(["...", totalPages]);
    }
}

function nextPage() {
    currentPage++;
    pagination(pages);
}

function prevPage() {
    currentPage--;
    pagination(pages);
}

pagination(pages);