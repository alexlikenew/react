import {useEffect, useState} from "react";

export function useMovies(query) {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const KEY = '6784f06d'
    useEffect(function () {
        // callback?.();
        const controller = new AbortController();

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

    return {movies, isLoading, error}
}