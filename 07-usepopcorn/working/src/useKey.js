import {useEffect} from "react";

export function useKey(key, callback) {

    useEffect(() => {
        function callback(e) {
            if (e.code.toLowerCase === key.toLowerCase) {
                callback();
            }
        }

        document.addEventListener('keydown', callback)
        return function () {
            document.removeEventListener('keydown', callback)
        }
    }, [callback, key]);
}