@echo off
setlocal
cd /d "%~dp0"
set "TLE_PYTHON="
for %%V in (3.12 3.11 3.10) do (
 py -%%V --version >nul 2>&1
 if not errorlevel 1 if not defined TLE_PYTHON set "TLE_PYTHON=py -%%V"
)
if not defined TLE_PYTHON (
 echo Instala Python 3.10 a 3.12 desde https://www.python.org/downloads/windows/
 echo En el instalador marca Add Python to PATH. Despues abre este archivo otra vez.
 pause
 exit /b 1
)
if not exist ".venv\Scripts\python.exe" %TLE_PYTHON% -m venv .venv
if errorlevel 1 (pause & exit /b 1)
".venv\Scripts\python.exe" local_tools.py
if errorlevel 1 pause
