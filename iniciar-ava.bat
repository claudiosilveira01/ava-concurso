@echo off
cd /D %~dp0
echo ============================================
echo   AVA Concursos - Servidor Local
echo ============================================
echo Nao feche esta janela enquanto estiver estudando.
echo Para desligar o servidor, feche esta janela (ou rode parar-ava.bat).
echo.

if not exist ".next" (
  echo Primeira execucao: compilando o projeto, aguarde alguns minutos...
  call npm run build
  echo.
)

echo Endereco: http://localhost:3010
echo.
call npm start -- -p 3010

pause
