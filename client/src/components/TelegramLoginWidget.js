import React, { useEffect, useRef } from 'react';

const TelegramLoginWidget = ({ botName, buttonSize = 'large', cornerRadius, requestAccess = 'write', usePic = true, onAuth }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        window.TelegramLoginWidget = {
            dataOnauth: (user) => {
                if (onAuth) onAuth(user);
            }
        };

        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', botName);
        script.setAttribute('data-size', buttonSize);
        if (cornerRadius !== undefined) {
            script.setAttribute('data-radius', cornerRadius);
        }
        script.setAttribute('data-request-access', requestAccess);
        script.setAttribute('data-userpic', usePic);
        script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
        script.async = true;

        if (containerRef.current) {
            containerRef.current.appendChild(script);
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
            delete window.TelegramLoginWidget;
        };
    }, [botName, buttonSize, cornerRadius, requestAccess, usePic, onAuth]);

    return <div ref={containerRef}></div>;
};

export default TelegramLoginWidget;
