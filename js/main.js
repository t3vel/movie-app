const API_KEY = "c74bbb2c5eb802a9aa5ef76c056c453a"; // Ваш API-ключ
const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=uk-UA&page=1`; // Змінили мову на українську
const API_NAME_SEARCH = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=uk-UA&query=`; // Теж для пошуку фільмів українською мовою
const API_URL_PAGE_2 = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=uk-UA&page=2`;
// Ваші функції залишаються без змін


async function getMovies(url) {
    try {
        const resp = await fetch(url);
        const respData = await resp.json();
        showMovies(respData.results); // TMDb повертає масив фільмів у полі `results`
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function getColorByRate(vote) {
    if (vote > 7) return "green";
    else if (vote > 5) return "orange";
    else return "red";
}

function showMovies(data) {
    const moviesEl = document.querySelector('.movies');

    // Очищуємо контейнер перед додаванням нових фільмів
    moviesEl.innerHTML = '';

    // Список жанрів для мапи жанрів
    const genreMap = {
        28: 'Бойовик',
        12: 'Пригода',
        16: 'Анімація',
        35: 'Комедія',
        80: 'Кримінал',
        99: 'Документальний',
        18: 'Драма',
        10751: 'Сімейний',
        14: 'Фентезі',
        36: 'Історичний',
        27: 'Жахи',
        10402: 'Музика',
        9648: 'Містика',
        10749: 'Романтика',
        878: 'Наукова фантастика',
        10770: 'Телефільм',
        53: 'Трилер',
        10752: 'Військовий',
        37: 'Вестерн'
    };


    // Перевіряємо, чи є дані для показу
    if (data && data.length > 0) {
        data.forEach((movie) => {
            const movieEl = document.createElement('div');
            movieEl.classList.add('movie');

            // Формуємо список жанрів
            const genres = movie.genre_ids.map(genreId => genreMap[genreId] || 'Unknown').join(', ');

            // Формуємо рік випуску
            const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'Unknown';

            // Округлення середньої оцінки
            const average = movie.vote_average.toFixed(1);

            movieEl.innerHTML = `
            <div class="movie__cover-inner">
                <img class="movie__cover" src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
                <div class="movie__cover--darkened"></div>
            </div>
            <div class="movie__info">
                <div class="movie__title">${movie.title}</div>
                <div class="movie__category">${genres}</div>
                <div class="movie__year">${releaseYear}</div>
                <div class="movie__average movie__average--${getColorByRate(average)}">${average}</div>
            </div>
            `;

            movieEl.addEventListener('click', () => openMovieModal(movie.id));
            moviesEl.appendChild(movieEl);
        });
    } else {
        moviesEl.innerHTML = `<p class = "no__movies">No movies found</p>`;  // Якщо нічого не знайдено
    }
}

// Обробка події для форми пошуку
const form = document.querySelector('.form');
const search = document.querySelector('.header-search');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const searchQuery = search.value.trim();

    if (searchQuery) {
        const apiSearchUrl = `${API_NAME_SEARCH}${searchQuery}&page=1`; // Додаємо значення пошукового запиту
        getMovies(apiSearchUrl); // Викликаємо функцію з новим URL для пошуку
    } else {
        getMovies(API_URL); // Якщо не введено пошукове слово, показуємо популярні фільми
    }

    search.value = ''; // Очищаємо поле пошуку
});

// Запуск функції для отримання популярних фільмів за замовчуванням
getMovies(API_URL);


const modalEl = document.querySelector('.modal');

async function openMovieModal(movieId) {
    try {
        const resp = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=uk-UA`);
        const respData = await resp.json();

        modalEl.classList.add('modal--show');
        document.body.classList.add('no-scroll'); // Додаємо клас для скриття прокрутки

        modalEl.innerHTML = `
            <div class="modal__card">
                <img class="modal__movie-backdrop" src="https://image.tmdb.org/t/p/w500${respData.poster_path}" alt="">
                <h2>
                    <span class="modal__movie-title">${respData.title}</span>
                    <span class="modal__movie-release-year"> - ${respData.release_date.split('-')[0]}</span>
                </h2>
                <ul class="modal__movie-info">
                    <li class="modal__movie-genre">Жанр - ${respData.genres.map(genre => `<span>${genre.name}</span>`).join(', ')}</li>
                    ${respData.runtime ? `<li class="modal__movie-runtime">Тривалість - ${respData.runtime} хвилин</li>` : ''}
                    <li class="modal__movie-overview ${respData.overview ? '' : 'hidden'}">
                        Опис - ${respData.overview || ''}
                    </li>

                </ul>
                <button type="button" class="modal__button-close">Закрити</button>
            </div>
        `;

        // Додаємо обробник для кнопки закриття модального вікна
        modalEl.querySelector('.modal__button-close').addEventListener('click', closeModal);
        // Додаємо обробник для закриття при кліку поза модальним контентом
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) {  // Перевіряємо, чи клік був саме на затемненій області
                closeModal();
            }
        });
    } catch (error) {
        console.error("Error fetching movie data:", error);
    }
}

function closeModal() {
    modalEl.classList.remove('modal--show');
    document.body.classList.remove('no-scroll'); // Повертаємо прокрутку
}

let currentPage = 1;

async function getMoviesPage(page = 1) {
    try {
        const resp = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=uk-UA&page=${page}`);
        const respData = await resp.json();
        showMovies(respData.results);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

document.querySelector('.next__btn').addEventListener('click', () => {
    currentPage++;
    getMoviesPage(currentPage);
});



document.querySelector('.prev__btn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        getMoviesPage(currentPage);
    }
});
