import {use, useEffect, useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import {StarRating} from "./StarRating.jsx";
// import './App.css'


const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = '6784f06d'

export default function App() {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [watched, setWatched] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedId, setSelectedId] = useState("null"
    );

    function handleSelectMovie(movieId) {
        setSelectedId((selectedId) => (selectedId === movieId ? null : movieId))
    }

    function handleCloseMovie() {
        setSelectedId(null)
    }

    function handleAddWAtched(movie) {
        console.log(watched)
        setWatched(watched => [...watched, movie])
        console.log(watched)
    }

    function handleDeleteWatched(id) {
        setWatched(watched => watched.filter(movie => movie.imdbID !== id))
    }


    useEffect(function () {

        const controller = new AbortController();
        handleCloseMovie()

        async function fetchMovies() {
            try {
                setIsLoading(true);
                setError('');
                const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {signal: controller.signal})

                if (!res.ok) throw new Error('Something go wrong')


                const data = await res.json()
                if (data.Response === 'False') throw new Error('Movie not found')
                setMovies(data.Search);
                console.log(data.Search)

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false)
            }
        }

        if (query.length < 3) {
            setMovies([])
            setError('')
            return
        }
        fetchMovies()

        return function () {
            controller.abort();
        }
    }, [query]);

    return (
        <>
            <NavBar>
                <Logo/>
                <Search query={query} setQuery={setQuery}/>
                <NumResults movies={movies}/>
            </NavBar>
            <Main>
                <Box>
                    {isLoading && <Loader/>}
                    {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie}/>}
                    {error && <ErrorMessage message={error}/>}
                </Box>

                <Box>
                    {selectedId ? <MovieDetails onAddWatched={handleAddWAtched}
                                                onCloseMovie={handleCloseMovie}
                                                selectedId={selectedId} watched={watched}/> :
                        <>
                            <WatchedSummary watched={watched}/>
                            <WatchedMoviesList watched={watched} onDeleteWatched={handleDeleteWatched}/>
                        </>
                    }

                </Box>
            </Main>
        </>
    );
}

function Loader() {
    return <p className='loader'>Loading...</p>
}

function ErrorMessage({message}) {
    return (
        <p className='error'>
            <span>{message}</span>
        </p>
    )
}

function NavBar({children}) {
    return (
        <nav className="nav-bar">
            {children}
        </nav>
    )
}

function Logo() {
    return (<div className="logo">
        <span role="img">🍿</span>
        <h1>usePopcorn</h1>
    </div>)
}

function NumResults({movies}) {
    return (<p className="num-results">
        Found <strong>{movies.length}</strong> results
    </p>)
}

function Search({query, setQuery}) {

    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
    )

}

function Main({children}) {

    return (
        <main className="main">
            {children}
        </main>)
}

function Box({children}) {

    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="box">
            <button
                className="btn-toggle"
                onClick={() => setIsOpen((open) => !open)}
            >
                {isOpen ? "–" : "+"}
            </button>
            {isOpen && children}
        </div>
    )
}

function MovieList({movies, onSelectMovie}) {
    return (<ul className="list list-movies">
        {movies?.map((movie) => (
            <Movie onSelectMovie={onSelectMovie} movie={movie} key={movie.imdbID}/>
        ))}
    </ul>)
}

function Movie({movie, onSelectMovie}) {
    return (
        <li onClick={() => onSelectMovie(movie.imdbID)} key={movie.imdbID}>
            <img src={movie.Poster} alt={`${movie.Title} poster`}/>
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>🗓</span>
                    <span>{movie.Year}</span>
                </p>
            </div>
        </li>
    )
}

function MovieDetails({selectedId, onCloseMovie, onAddWatched, watched}) {

    const [movie, setMovie] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [userRating, setUserRating] = useState(0);
    const isWatched = watched.map(movie => movie.imdbID).includes(selectedId)
    const watchedUserrating = watched.find(movie => movie.imdbID === selectedId)?.userRating;
    // eslint-disable


    const {
        Title: title, Year: year, Poster: poster, Runtime: runtime,
        imdbRating, Plot: plot, Released: released, Actors: actors,
        Director: director, Genre: genre, imdbID: imdbID,
    } = movie;


    function handleAdd() {

        const newWatchedMovie = {
            imdbID: selectedId,
            title, year, poster, imdbRating: Number(imdbRating),
            runtime: Number(runtime.split(' ').at(0)), userRating
        }

        onAddWatched(newWatchedMovie)
        onCloseMovie('')
    }

    function callback(e) {
        if (e.code === 'Escape') {
            onCloseMovie();
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', callback)
        return function () {
            document.removeEventListener('keydown', callback)
        }
    }, [onCloseMovie]);

    useEffect(() => {

        async function getMovieDetails() {
            setIsLoading(true)
            const res = await fetch(
                `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`)
            const data = await res.json();
            setMovie(data)
            setIsLoading(false)
        }

        getMovieDetails();
    }, [selectedId]);

    useEffect(() => {
        if (!title) return;
        document.title = `Movie ${title}`

        return function () {
            document.title = 'usePopcorn'
        }
    }, [title]);


    return <div className='details'>
        {isLoading ? <Loader/> : <>
            <header>
                <button className='btn-back' onClick={onCloseMovie}>&larr;</button>
                <img src={poster} alt={`Poster of a movie ${movie}`}/>
                <div className='details-overview'>
                    <h2>{title}</h2>
                    <p>{released}</p>
                    <p>{genre}</p>
                    <p><span>*</span>{imdbRating} Imdb Rating</p>
                </div>

            </header>

            <section>
                {!isWatched ? <div className='rating'>
                    <>
                        <StarRating maxRating={10} size={24} color={'yellow'} onSetRating={setUserRating}/>
                        {userRating > 0 && <button className='btn-add' onClick={handleAdd}>Add movie</button>}
                    </>

                </div> : <p>You rated this movie {watchedUserrating}</p>}


                <p><em>{plot}</em></p>
                <p>Starrind {actors}</p>
                <p>Directed by {director}</p>

            </section>

        </>}

        {selectedId}</div>
}

function WatchedSummary({watched}) {
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));
    return (
        <div className="summary">
            <h2>Movies you watched</h2>
            <div>
                <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                </p>
                <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{avgUserRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRuntime.toFixed(1)} min</span>
                </p>
            </div>
        </div>
    )
}

function WatchedMoviesList({watched, onDeleteWatched}) {
    return (<ul className="list">
        {watched.map((movie) => (
            <WatchedMovie onDeleteWatched={onDeleteWatched} movie={movie} key={movie.imdbID}/>
        ))}
    </ul>)
}

function WatchedMovie({movie, onDeleteWatched}) {
    return (<li key={movie.imdbID}>
        <img src={movie.poster} alt={`${movie.title} poster`}/>
        <h3>{movie.Title}</h3>
        <div>
            <p>
                <span>⭐️</span>
                <span>{movie.imdbRating}</span>
            </p>
            <p>
                <span>🌟</span>
                <span>{movie.userRating}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{movie.runtime} min</span>
            </p>

            <button className='btn-delete' onClick={() => onDeleteWatched(movie.imdbID)}>X</button>
        </div>
    </li>)
}


