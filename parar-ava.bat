@echo off
echo Procurando o servidor AVA Concursos na porta 3010...

set ACHOU=0
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3010" ^| findstr "LISTENING"') do (
  echo Encerrando processo %%p...
  taskkill /F /PID %%p >nul 2>&1
  set ACHOU=1
)

if "%ACHOU%"=="1" (
  echo Servidor encerrado.
) else (
  echo Nenhum servidor rodando na porta 3010.
)

pause
