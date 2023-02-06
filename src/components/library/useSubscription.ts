import { useEffect, useState } from 'react';

const baseWebsocketUrl = JSON.parse(window.localStorage.getItem('serverBaseURL')!).replace('http', 'ws');

const useSubscription = <T>(path: string, callback?: (newValue: T) => boolean | void) => {
    const [state, setState] = useState<T | undefined>();

    useEffect(() => {
        const wsc = new WebSocket(`${baseWebsocketUrl}${path}`);

        wsc.onmessage = (e) => {
            const data = JSON.parse(e.data) as T;
            if (callback) {
                // If callback is specified, only update state if callback returns true
                // This is so that useSubscription can be used without causing rerender
                if (callback(data) === true) {
                    setState(data);
                }
            } else {
                setState(data);
            }
        };

        return () => wsc.close();
    }, [path]);

    return { data: state };
};

export default useSubscription;
