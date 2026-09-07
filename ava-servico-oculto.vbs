' Liga o servidor do AVA Concursos sem abrir janela nenhuma na tela.
' Roda automaticamente no login do Windows (copia deste arquivo na pasta
' "Inicializar" do usuario). So inicia se a porta 3010 ainda nao estiver
' em uso, pra nunca abrir duas copias sem querer.
Set objShell = CreateObject("WScript.Shell")
objShell.CurrentDirectory = "C:\dev-projects\ava-concurso"

portaLivre = objShell.Run("cmd /c netstat -ano | findstr "":3010"" | findstr LISTENING >nul", 0, True)

If portaLivre <> 0 Then
  objShell.Run "cmd /c npm start -- -p 3010 >> ava-servidor.log 2>&1", 0, False
End If
