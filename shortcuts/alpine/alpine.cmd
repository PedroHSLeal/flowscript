@ECHO OFF

:: --detach = modo background
:: --interactive = stdin habilitado
:: --tty = pseudo-tty habilitado

podman run ^
    --detach ^
    --interactive ^
    --tty ^
alpine