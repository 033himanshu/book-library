const container = document.querySelector('.container') // container shows all books options which less details
const showBookContainer = document.querySelector('.show-book') // shows single book with complete detail
const displayType = document.querySelectorAll('.display-type img') // grid-list-sorting container
const sortBy  = document.querySelector('#sort')
const searchInput = document.querySelector('.search-input')
const previousPageBtn = document.querySelector('.paging .previous')
const nextPageBtn = document.querySelector('.paging .next')
const currentPage = document.querySelector('.paging .current')
const loading = document.querySelector('.loading')
let books = [] // all books fetched from API, this array will be working like our database, we search, sort according to data in this array only
const MAX_BOOK_PER_PAGE = 6 // allowed max books per page
let pageLimit = 1 // max available page, will dynamically change

let currentUsingBooksIndeces = [] // we use this array so that we can store all indices which we have to render on screen
// such that we need not call again fetch fuction to get All videos after searching operation
// we can apply paginations and sorting based on indices in this array only



// grid - list toggle handling
displayType.forEach(item => {
    item.addEventListener('click', ()=>{
        for(let type of displayType){
            type.classList.remove('active')
            container.classList.remove(type.getAttribute('value'))
        }
        item.classList.add('active')
        container.classList.add(item.getAttribute('value'))
    })
})



// handling containers data
const insertBookIntoContainer = (page=1) => {
    document.title = "Library"
    showBookContainer.style.display = "none"
    container.style.display = ""
    container.querySelectorAll('.book-card').forEach(item => item.remove()) 
    // delete all books from container as it going to show different books now
    previousPageBtn.classList.remove('disabled')
    nextPageBtn.classList.remove('disabled')
    pageLimit = Math.ceil((currentUsingBooksIndeces.length)/MAX_BOOK_PER_PAGE) || 1
    // calculating Maximum Page Limit according to current books
    if(page===1){
        previousPageBtn.classList.add('disabled')
    }
    if(page===pageLimit){
        nextPageBtn.classList.add('disabled')
    }
    currentPage.textContent = page

    let start = MAX_BOOK_PER_PAGE*(page-1)
    let end = Math.min(MAX_BOOK_PER_PAGE*page, currentUsingBooksIndeces.length)
    // starting ending indices according to pagination
    for(let i=start;i<end;++i){
        let id = currentUsingBooksIndeces[i]
        let book = books[id]
        let {title, authors, imageLinks, publisher, publishedDate} = book
        const bookCard = document.createElement('div')
        bookCard.classList.add('book-card')
        bookCard.innerHTML = `
            <img src="${imageLinks}" alt="" class="thumbnail">
            <div class="details">
                <div class="title">${title}</div>
                <div class="book-info">
                    <img src="images/author.png" class="book-info-icon">
                    <span class="authors info">${authors}</span>
                    <span class="tooltiptext">Auther(s): ${authors}</span>
                </div>
                <div class="book-info">
                    <img src="images/publisher.png" class="book-info-icon">
                    <span class="publisher info">${publisher}<span>
                    <span class="tooltiptext">Pub: ${publisher}</span>
                </div>
                <div class="book-info">
                    <img src="images/publishedDate.png" class="book-info-icon">
                    <span class="published-date info">${publishedDate}</span>
                    <span class="tooltiptext">Pub-Date: ${publishedDate}</span>
                </div>
            </div>
        `
        container.appendChild(bookCard)
        const queryString = Object.entries(book).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&")
        const url = `${window.location.href}?${queryString}`;
        // sharing book information to next page in url
        bookCard.addEventListener('click', ()=>{
            window.open(`${url}`, "_blank")
        })
    }
}



//fetch all books from api
const fetchBooks = async (page) => {
    const url =  `https://api.freeapi.app/api/v1/public/books?page=${page}&limit=20`;
    const options = {method: 'GET', headers: {accept: 'application/json'}};
    try {
        const response = await fetch(url, options);
        let data = await response.json();
        data = data.data.data
        if(data.length===0) return false
        for(let book of data){
            let {title, subtitle, description, authors, imageLinks, publisher, publishedDate, averageRating, ratingsCount,categories} = book.volumeInfo

            // handle Missing Data
            authors = authors?.reduce((acc, author)=> acc+", "+author)
            categories = categories?.reduce((acc, category)=> acc+", "+category)
            authors = authors || "UnKnown"
            publisher= publisher || "UnKnown"
            publishedDate = publishedDate || "UnKnown"
            ratingsCount = ratingsCount || 0
            subtitle = subtitle || ""
            title = title || "Unknown"
            description = description || ""
            categories = categories || ""
            averageRating = averageRating || 0
            imageLinks = imageLinks?.thumbnail
            // store all data in books array
            books.push({title, subtitle, description, authors, imageLinks, publisher, publishedDate, averageRating, ratingsCount,categories})
        }
        return true
    } catch (error) {
        console.error(error);
        return  false
    }
}
// this fetch All  Books
// all Books because it will help us in searching for Book
const fetchAllBooks = async()=>{
    let page = 1;
    loading.style.display = ""
    while(await fetchBooks(page)){
        page += 1
        console.log(books.length)
        console.log(page, "Fetched")
    }
    loading.style.display = "none"
}







//pagination buttons
previousPageBtn.addEventListener('click',()=>{
    let prevPage = parseInt(currentPage.textContent)-1
    if(prevPage<1) return
    insertBookIntoContainer(prevPage)
})
nextPageBtn.addEventListener('click',()=>{
    let nextPage = parseInt(currentPage.textContent)+1
    if(nextPage>pageLimit) return
    insertBookIntoContainer(nextPage)
})



// show information about a single book
const showBook = book => {    
    loading.style.display = "none"
    document.title = book.title
    showBookContainer.innerHTML = `
        <img src="${book.imageLinks}" alt="" class="thumbnail">
        <div class="stars">
            <span class="fa fa-star"></span>
            <span class="fa fa-star"></span>
            <span class="fa fa-star"></span>
            <span class="fa fa-star"></span>
            <span class="fa fa-star"></span>
            (<span>${book.ratingsCount}</span>)
        </div>
        <div class="book-data">
            <div class="title">${book.title}</div>
            <div class="subtitle">${book.subtitle}</div>
            <div class="description">
                ${book.description}
            </div>
            
            <table>
                <tr>
                    <th>Authors</th>
                    <td>${book.authors}</td>
                </tr>
                ${
                    book.publisher !== 'UnKnown' ? `
                    <tr>
                        <th>Publisher</th>
                        <td>${book.publisher}</td>
                    </tr>
                    ` : ""
                }
                ${
                    book.publishedDate !== 'UnKnown' ? `
                    <tr>
                        <th>Published Date</th>
                        <td>${book.publishedDate}</td>
                    </tr>
                    ` : ""
                }
                ${
                    book.categories ? `
                    <tr>
                        <th>Category</th>
                        <td>${book.categories}</td>
                    </tr>
                    ` : ""
                }
                
            </table>
        </div>
    `
    const stars = showBookContainer.querySelectorAll('.fa')
    data.averageRating  = data.averageRating || 0
    for(let i=1;i<=data.averageRating;++i){
        stars[i-1].classList.add('checked')
    }
}

// sort currentUsingBooks according to input
const sortAndInsertInContainer = () => {
    if(sortBy.value === 'title'){
        currentUsingBooksIndeces.sort((a, b)=> books[a].title < books[b].title ? -1 : 1)
    }else if(sortBy.value == 'date'){
        currentUsingBooksIndeces.sort((a, b)=> books[a].publishedDate < books[b].publishedDate ? -1 : 1)
    }
    insertBookIntoContainer()
}

sortBy.addEventListener('input', ()=>sortAndInsertInContainer())


const initialSetUp = ()=>{
    currentUsingBooksIndeces=[]
    for(let i=0;i<books.length;++i)
        currentUsingBooksIndeces.push(i)
    sortAndInsertInContainer()
}


// checking the url
// if data is present in url we show a book with details
// else we show all books
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const data = {};
for (const [key, value] of urlParams.entries()) {
    data[key] = decodeURIComponent(value);
}
if(data?.title){
    container.style.display = "none"
    showBookContainer.style.display = ""
    showBook(data)
}else{
    fetchAllBooks().then(()=>{
        initialSetUp()
    })
}

document.querySelector('.logo').addEventListener('click',()=>{
    window.location.href = window.location.origin
})

searchInput.addEventListener('input',async ()=>{
    let value = searchInput.value.trim().toLowerCase()
    if(value===""){
        initialSetUp() // show full content
        return
    }
    if(books.length===0)
        await fetchAllBooks()

    currentUsingBooksIndeces=[]
    for(let id=0;id<books.length;++id){
        if(books[id].title.toLowerCase().indexOf(value)!=-1 || books[id].authors.toLowerCase().indexOf(value)!=-1)
            currentUsingBooksIndeces.push(id)
    }
    console.log(currentUsingBooksIndeces)
    sortAndInsertInContainer()
})