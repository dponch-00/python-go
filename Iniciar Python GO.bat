@echo off
rem Abre Python GO en esta PC con un servidor local (necesario para el modo sin conexion y Python).
cd /d "%~dp0"
set PORT=8765
echo.
echo   Python GO corriendo en http://localhost:%PORT%
echo   Cierra esta ventana para detenerlo.
echo.
start "" "http://localhost:%PORT%"
python tools\serve.py %PORT%
